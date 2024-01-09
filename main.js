const { MongoClient } = require("mongodb");
const express = require("express");
const BodyParser = require("body-parser");
const Cors = require("cors");
const path = require('path');

const server = express();
server.use(express.static('public'));
server.use('/src/games/game1', express.static(path.join(__dirname, 'src/games/game1')));
server.use('/src/games/game2', express.static(path.join(__dirname, 'src/games/game2')));
server.use('/src/games/game3', express.static(path.join(__dirname, 'src/games/game3')));

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

const client = new MongoClient('mongodb+srv://pabmergom:2002@cluster0.odgnvyk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var collection;

// Función para establecer la conexión y crear el índice único
async function setupDatabase() {
  try {
    await client.connect();
    collection = client.db("Juego").collection("Usuario");

    // Crear una indexación única en el campo "nombre"
    await collection.createIndex({ nombre: 1 }, { unique: true });

    console.log("Índice único creado en el campo 'nombre'");
  } catch (e) {
    console.error("Error al conectar y configurar la base de datos", e);
  }
}

// Llamar a la función de configuración de la base de datos al iniciar el servidor
setupDatabase();

server.post("/guardarDatos", async (request, response, next) => {
  try {
    const data = request.body;

    // Verificar si el usuario ya existe
    const existingUser = await collection.findOne({ nombre: data.nombre });

    if (existingUser) {
      return response.status(400).json({ error: "El usuario ya existe" });
    }

    // Insertar los datos en la colección de perfiles
    const result = await collection.insertOne(data);

    // Redirigir al usuario a la página game1 después de guardar los datos
    response.redirect('/game1');
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.listen("3000", () => {
  console.log("Listening at :3000...");
});

server.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public/index.html');
  res.sendFile(indexPath);
});

server.get('/form', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/form/form.html');
  res.sendFile(indexPath);
});

server.get('/game1', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game1/index1.html');
  res.sendFile(indexPath);
});

server.get('/game2', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game2/index2.html');
  res.sendFile(indexPath);
});

server.get('/game3', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game3/index3.html');
  res.sendFile(indexPath);
});
