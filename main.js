const { MongoClient } = require("mongodb");
const express = require("express");
const BodyParser = require("body-parser");
const Cors = require("cors");
const path = require('path');



const server = express();
server.use(express.static('public'));

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

const client = new MongoClient('mongodb+srv://pabmergom:2002@cluster0.odgnvyk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var collection;

server.post("/guardarDatos", async (request, response, next) => {
  try {
    const data = request.body;

    // Asegúrate de que la colección esté definida
    if (!collection) {
      throw new Error("La conexión a la base de datos no está establecida correctamente.");
    }

    // Inserta los datos en la colección de perfiles
    const result = await collection.insertOne(data);

    response.status(201).json({ message: "Datos guardados exitosamente", dataId: result.insertedId });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.listen("3000", async () => {
  try {
    await client.connect();
    collection = client.db("Juego").collection("Usuario");
    console.log("Listening at :3000...");
  } catch (e) {
    console.error(e);
  }
});

server.get('/',async (req, res) => {
  const indexPath = path.join(__dirname, 'public/index.html');
  res.sendFile(indexPath);
});

server.get('/form',async (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/form/form.html');
  res.sendFile(indexPath);
});
