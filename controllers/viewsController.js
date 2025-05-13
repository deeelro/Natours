const { path } = require('../app');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync (async (req, res) => {
    const tours = await Tour.find(); // Asegúrate de que esto devuelve un array

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync( async (req, res, next) => {
    // 1) Get the data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    // Si no existe el tour, lanza un error
    if(!tour) {
        return next(new AppError('There is no tour with that name.', 404)); 
    }
    // 2) Build template

    // 3) Render template using tour data from step 1
    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    });
});


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
        user: req.user
    });
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

