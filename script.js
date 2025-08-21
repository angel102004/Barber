// Ejemplo de mensaje de confirmación al enviar el formulario
document.getElementById('reserve-form').addEventListener('submit', function(event) {
    // Esta línea es opcional, previene el envío hasta que estés seguro de que funciona.
   // event.preventDefault();
    alert('¡Gracias! Tu solicitud ha sido enviada. Te contactaremos en minutos.');
});