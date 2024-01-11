const { MongoClient, ObjectId } = require("mongodb");

const express = require("express");
const session = require('express-session');
const BodyParser = require("body-parser");
const Cors = require("cors");
const path = require('path');


const server = express();
server.use(express.static('public'));
server.use('/src/games/form', express.static(path.join(__dirname + '/src/games/form')));
server.use('/src/games/game1', express.static(path.join(__dirname, 'src/games/game1')));
server.use('/src/games/game2', express.static(path.join(__dirname, 'src/games/game2')));
server.use('/src/games/game3', express.static(path.join(__dirname, 'src/games/game3')));

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

server.use(session({
  secret: 'ContraseñaSegura098',
  resave: false,
  saveUninitialized: true,
}));

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

  } catch (e) {
    console.error("Error al conectar y configurar la base de datos", e);
  }
}

// Llamar a la función de configuración de la base de datos al iniciar el servidor
setupDatabase();

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


// Middleware para validar el formulario
const validateFormMiddleware = (data) => {
  if (data.nombre.length < 5 || data.nombre.length > 15) {
    throw new Error('El nombre debe tener entre 5 y 15 caracteres.');
  }

  if (isNaN(data.edad) || data.edad < 3 || data.edad > 99) {
    throw new Error('La edad debe estar entre 3 y 99 años.');
  }
};


// Middleware para manejar el formulario y redireccionar
server.post("/form", async (request, response, next) => {
  try {
    const data = request.body;

    // Validar formulario
    validateFormMiddleware(data);

    // Insertar datos en la colección y guardar el id en la sesión
    const result = await collection.insertOne(data);
    const userId = result.insertedId.toString();
    request.session.userId = userId;

    // Redirigir al usuario a la URL /menu después del registro exitoso
    response.status(200).json({ redirect: '/menu' });
  } catch (error) {
    console.error(error);

    // Manejar errores específicos y enviar respuestas adecuadas
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    }

    response.status(500).json({ error: "Error interno del servidor" });
  }
});


server.get('/menu', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/menu/menu.html');
  res.sendFile(indexPath);
});

server.get('/introduccion-1', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game1/introduccion.html');
  res.sendFile(indexPath);
});

server.get('/game1', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game1/index1.html');
  res.sendFile(indexPath);
});


// Endpoint para recibir la puntuación del juego después de que el jugador complete el juego
server.post("/gamesave", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId); // Obtiene el ID del usuario desde la sesión
    const { scoregame1 } = request.body;

    if (!userId || isNaN(scoregame1)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    // Actualizar el documento del usuario con la puntuación del juego 1
    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame1: parseInt(scoregame1, 10)
        },
      },
      { upsert: true }
    );
    

    const result = await collection.findOne({ _id: userId });

    console.log(result); // Imprime en la consola el resultado de la consulta

    // Puedes acceder al campo scoregame1 de la siguiente manera
    if (result) {
      console.log("Score en game1:", result.scoregame1);
    } else {
      console.log("Usuario no encontrado o sin score en game1.");
    }

    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});


server.get('/game2', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game2/index2.html');
  res.sendFile(indexPath);
});

server.get('/game3', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game3/index3.html');
  res.sendFile(indexPath);
});
