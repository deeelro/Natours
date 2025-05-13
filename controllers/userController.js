const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


// Configuro el nombre y la ruta de la imagen que se va a subir
/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]; // del objeto devuelto, cojo el segundo elemento (mimetype: extension)
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
}); */

const multerStorage = multer.memoryStorage(); // Almacena la imagen en memoria

// Compruebo si el archivo es una imagen
const multerFilter = (req, file, cb) => {
  // 1) Check if the file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Por favor, sube una imagen valida', 400), false);
  }
};

// Configuro la subida de archivos
const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter 
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // guardo en el cuerpo de la peticion un nombre nuevo de la imagen
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; 

  // Proceso la imagen
  await sharp(req.file.buffer)
    .resize(500, 500) // redimensiono
    .toFormat('jpeg') // cambio el formato 
    .jpeg({ quality: 90 }) // le bajo la calidad al 90%
    .toFile(`public/img/users/user-${req.user.id}-${Date.now()}.jpeg`); // la guardo en la carpeta

    next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; // Si hay una foto, la añado al objeto

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
