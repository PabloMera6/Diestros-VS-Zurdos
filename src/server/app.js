const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Configuración de bodyParser para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Conéctate a tu cluster de MongoDB Atlas (reemplaza <USERNAME>, <PASSWORD>, y <CLUSTER_URI>)
mongoose.connect('mongodb+srv://pabmergom:2002@cluster0.odgnvyk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define un esquema para los datos del usuario dentro de la colección 'usuario'
const usuarioSchema = new mongoose.Schema({
  edad: Number,
  manoHabil: String,
  manoMovil: String,
  horasUsoMovil: String,
});

// Crea un modelo basado en el esquema
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Manejar la solicitud POST en la ruta '/guardarDatos'
app.post('/guardarDatos', async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const data = req.body;

    // Crear una instancia del modelo Usuario con los datos recibidos
    const usuarioInstancia = new Usuario(data);

    // Guardar el usuario en MongoDB Atlas
    await usuarioInstancia.save();

    console.log('Datos guardados:', data);

    // Responder con éxito (puedes ajustar el código de estado según tus necesidades)
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar datos:', error);
    // Responder con un error (puedes ajustar el código de estado según tus necesidades)
    res.status(500).send('Error al procesar la solicitud');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.get('/prueba',async (req, res) => {
  res.send('prueba');
  res.status(200).send('prueba');
});