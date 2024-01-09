document.getElementById('user-data-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    var age = document.getElementById('edad').value;
    var favHand = document.getElementById('manoHabil').value;
    var phoneHand = document.getElementById('manoUso').value;
    var phoneUsageHours = document.getElementById('horasUsoMovil').value;
  
    var data = {
      edad: age,
      manoHabil: favHand,
      manoMovil: phoneHand,
      horasUsoMovil: phoneUsageHours
    };
  
    // Send the data to the server
    fetch('/guardarDatos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function() {
      // After the data is sent, redirect to the game page
      window.location.href = 'src/games/game1/index1.html';
    });
  });