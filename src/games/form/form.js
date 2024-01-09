document.getElementById('user-data-form').addEventListener('submit', function(event) {
  event.preventDefault();

  var username = document.getElementById('nombre').value;
  var age = document.getElementById('edad').value;
  var favHand = document.getElementById('manoHabil').value;
  var phoneHand = document.getElementById('manoUso').value;
  var phoneUsageHours = document.getElementById('horasUsoMovil').value;

  var data = {
    nombre: username,
    edad: age,
    manoHabil: favHand,
    manoMovil: phoneHand,
    horasUsoMovil: phoneUsageHours
  };

  // Guardar los datos en el sessionStorage
  sessionStorage.setItem('userData', JSON.stringify(data));

  // Enviar los datos al servidor
  fetch('/guardarDatos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(function(response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }).then(function() {
    // Después de enviar los datos, redirigir a la página del juego
    window.location.href = 'src/games/game1/index1.html';
  }).catch(function(error) {
    // Mostrar el error al usuario
    alert(error.message);
    
    // Recuperar los datos del sessionStorage y llenar el formulario
    var savedData = JSON.parse(sessionStorage.getItem('userData'));
    document.getElementById('nombre').value = savedData.nombre;
    document.getElementById('edad').value = savedData.edad;
    document.getElementById('manoHabil').value = savedData.manoHabil;
    document.getElementById('manoUso').value = savedData.manoMovil;
    document.getElementById('horasUsoMovil').value = savedData.horasUsoMovil;
  });
});
