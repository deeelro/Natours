import { showAlert } from './alerts.js'; // importo la función showAlert para mostrar mensajes al usuario
const stripe = Stripe('pk_test_51RNxvpGhYrFvr3KDBIfeQDTdcfolAFuSOYhrVXvwgr2I7MF0nKcIO5IbH77gZmPXk6OLMbkAB4RNkSwCPEz8wCny00mF7QAhx1');

const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
        const session = await axios.get(
            `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
            { withCredentials: true } // Asegura que las cookies se envíen
        );
        // 2) Create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id // redirijo a la sesion de pago
        });

    } catch (err) {
        console.log(err);
        showAlert('Ha ocurrido un error al procesar tu pago. Por favor, inténtalo de nuevo más tarde.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bookBtn = document.querySelector('#book-tour');
    if (bookBtn) {
        console.log('El botón de reserva existe');
        bookBtn.addEventListener('click', e => {
            e.target.textContent = 'Procesando...'; // Cambia el texto del botón a "Procesando..."
            const tourId = e.target.dataset.tourId; // obtengo el ID del tour desde el atributo data-tour-id del botón
            bookTour(tourId); // llamo a la función bookTour y le paso el ID del tour a comprar
        });
    }
});
