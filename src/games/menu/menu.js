// form.js

document.getElementById('user-data-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const nombreInput = document.getElementById('nombre');
  const edadInput = document.getElementById('edad');
  const errorMessageElement = document.getElementById('error-message');

  // Validar longitud del nombre
  const nombreValue = nombreInput.value.trim();
  if (nombreValue.length < 5 || nombreValue.length > 15) {
    showError('El nombre debe tener entre 5 y 15 caracteres.');
    return;
  }

  // Validar rango de edad
  const edadValue = parseInt(edadInput.value, 10);
  if (isNaN(edadValue) || edadValue < 3 || edadValue > 99) {
    showError('La edad debe estar entre 3 y 99 años.');
    return;
  }

  // Restablecer mensaje de error si no hay errores
  errorMessageElement.textContent = '';

  // Continuar con el envío del formulario si no hay errores
  this.submit();
});

function showError(message) {
  const errorMessageElement = document.getElementById('error-message');
  errorMessageElement.textContent = message;
}
