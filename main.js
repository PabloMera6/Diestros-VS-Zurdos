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
server.set('views', path.join(__dirname, 'views'));

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());
server.set('view engine', 'ejs');

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


server.post("/gamesave1-a", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame1d } = request.body;

    if (!userId || isNaN(scoregame1d)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame1d: parseInt(scoregame1d, 10)
        },
      },
      { upsert: true }
    );
    
    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave1-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame1i } = request.body;

    if (!userId || isNaN(scoregame1i)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame1i: parseInt(scoregame1i, 10)
        },
      },
      { upsert: true }
    );

    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.get('/resultados1', async (req, res) => {
  try {
    const userId = new ObjectId(req.session.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const averageData = await collection.aggregate([
      {
        $group: {
          _id: null,
          mediagame1d: { $avg: '$scoregame1d' },
          mediagame1i: { $avg: '$scoregame1i' },
        },
      },
    ]).toArray();
    const porcentajeRespectoMediaDerecha = ((userData.scoregame1d - averageData[0].mediagame1d) / averageData[0].mediagame1d) * 100;
    const porcentajeRespectoMediaIzquierda = ((userData.scoregame1i - averageData[0].mediagame1i) / averageData[0].mediagame1i) * 100;

    res.render('resultados', { datosUsuario1: userData.scoregame1d, datosUsuario2: userData.scoregame1i, datosMedia1: porcentajeRespectoMediaDerecha, datosMedia2: porcentajeRespectoMediaIzquierda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/introduccion-2', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game2/introduccion.html');
  res.sendFile(indexPath);
});

server.get('/game2', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game2/index2.html');
  res.sendFile(indexPath);
});

server.post("/gamesave2-a", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame2d } = request.body;
    console.log(scoregame2d);
    console.log(userId);
    if (!userId || isNaN(scoregame2d)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame2d: parseFloat(scoregame2d)
        },
      },
      { upsert: true }
    );
    
    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave2-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame2i } = request.body;

    if (!userId || isNaN(scoregame2i)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame2i: parseFloat(scoregame2i)
        },
      },
      { upsert: true }
    );

    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.get('/resultados2', async (req, res) => {
  try {
    const userId = new ObjectId(req.session.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const averageData = await collection.aggregate([
      {
        $group: {
          _id: null,
          mediagame2d: { $avg: '$scoregame2d' },
          mediagame2i: { $avg: '$scoregame2i' },
        },
      },
    ]).toArray();
    const porcentajeRespectoMediaDerecha = ((userData.scoregame2d - averageData[0].mediagame2d) / averageData[0].mediagame2d) * 100;
    const porcentajeRespectoMediaIzquierda = ((userData.scoregame2i - averageData[0].mediagame2i) / averageData[0].mediagame2i) * 100;

    res.render('resultados2', { datosUsuario2d: userData.scoregame2d, datosUsuario2i: userData.scoregame2i, datosMedia2d: porcentajeRespectoMediaDerecha, datosMedia2i: porcentajeRespectoMediaIzquierda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/introduccion-3', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game3/introduccion.html');
  res.sendFile(indexPath);
});

server.get('/game3', (req, res) => {
  const indexPath = path.join(__dirname, 'src/games/game3/index3.html');
  res.sendFile(indexPath);
});

server.post("/gamesave3-a", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame3d } = request.body;
    console.log(scoregame3d);
    console.log(userId);
    if (!userId || isNaN(scoregame3d)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame3d: parseFloat(scoregame3d)
        },
      },
      { upsert: true }
    );
    
    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave3-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.session.userId);
    const { scoregame3i } = request.body;

    if (!userId || isNaN(scoregame3i)) {
      return response.status(400).json({ error: 'Parámetros incorrectos.' });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          scoregame3i: parseFloat(scoregame3i)
        },
      },
      { upsert: true }
    );

    response.status(200).json({ message: 'Puntuación del juego guardada exitosamente.' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.get('/resultados3', async (req, res) => {
  try {
    const userId = new ObjectId(req.session.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const averageData = await collection.aggregate([
      {
        $group: {
          _id: null,
          mediagame3d: { $avg: '$scoregame3d' },
          mediagame3i: { $avg: '$scoregame3i' },
        },
      },
    ]).toArray();
    const porcentajeRespectoMediaDerecha = ((userData.scoregame3d - averageData[0].mediagame3d) / averageData[0].mediagame3d) * 100;
    const porcentajeRespectoMediaIzquierda = ((userData.scoregame3i - averageData[0].mediagame3i) / averageData[0].mediagame3i) * 100;

    res.render('resultados3', { datosUsuario3d: userData.scoregame3d, datosUsuario3i: userData.scoregame3i, datosMedia3d: porcentajeRespectoMediaDerecha, datosMedia3i: porcentajeRespectoMediaIzquierda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
