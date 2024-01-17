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
server.use('/src/resultados', express.static(path.join(__dirname, 'src/resultados')));
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

server.get('/menu', async (req, res) => {
  let mostrar_resultados = false;
  const userId = new ObjectId(req.session.userId);
  const userData = await collection.findOne({ 
    _id: userId, 
    scoregame1d: { $exists: true },
    scoregame1i: { $exists: true },
    scoregame2d: { $exists: true },
    scoregame2i: { $exists: true },
    scoregame3d: { $exists: true },
    scoregame3i: { $exists: true },
  });

  if (userData) {
    mostrar_resultados = true;
  }
  res.render('menu', { mostrar_resultados });
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

server.get('/resultados-finales', (req, res) => {
  const indexPath = path.join(__dirname, 'src/resultados/resultados-finales.html');
  res.sendFile(indexPath);
});

server.get('/resultados-edad', async(req, res) => {
  try {
    const userId = new ObjectId(req.session.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const ageRanges = {
      'Inferior a 14 años': { min: 3, max: 14 },
      '15 a 17 años': { min: 15, max: 17 },
      '18 a 24 años': { min: 18, max: 24 },
      '25 a 35 años': { min: 25, max: 35 },
      '36 a 45 años': { min: 36, max: 45 },
      '46 a 60 años': { min: 46, max: 60 },
      'Superior a 60 años': { min: 61, max: 99 },
     };
     
    let rangoEdad;
    const edad_usuario = userData.edad;

    if (edad_usuario <= 14) {
    rangoEdad = 'Inferior a 14 años';
    } else if (edad_usuario >= 15 && edad_usuario <= 17) {
    rangoEdad = '15 a 17 años';
    } else if (edad_usuario >= 18 && edad_usuario <= 24) {
    rangoEdad = '18 a 24 años';
    } else if (edad_usuario >= 25 && edad_usuario <= 35) {
    rangoEdad = '25 a 35 años';
    } else if (edad_usuario >= 36 && edad_usuario <= 45) {
    rangoEdad = '36 a 45 años';
    } else if (edad_usuario >= 46 && edad_usuario <= 60) {
    rangoEdad = '46 a 60 años';
    } else {
    rangoEdad = 'Superior a 60 años';
    }

    const { min: minAge, max: maxAge } = ageRanges[rangoEdad];
    
    const usersInRange = await collection.find({
      edad: { $gte: minAge, $lte: maxAge }
     }).toArray();

    const averageScores = await collection.aggregate([
    {
    $match: { edad: { $gte: minAge, $lte: maxAge } },
    },
    {
    $group: {
      _id: null,
      avgScoreGame1d: { $avg: { $ifNull: ['$scoregame1d', 0] } },
      avgScoreGame1i: { $avg: { $ifNull: ['$scoregame1i', 0] } },
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 0] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 0] } },
      avgScoreGame3d: { $avg: { $ifNull: ['$scoregame3d', 0] } },
      avgScoreGame3i: { $avg: { $ifNull: ['$scoregame3i', 0] } },
    },
    },
    ]).toArray();

    // Calcular la puntuación de cada usuario por encima de la media para cada juego
    const scoresAboveAverage = usersInRange.map((user) => ({
      ...user,
      score1dAboveAverage: user.scoregame1d - averageScores[0].avgScoreGame1d,
      score1iAboveAverage: user.scoregame1i - averageScores[0].avgScoreGame1i,
      score2dAboveAverage: user.scoregame2d - averageScores[0].avgScoreGame2d,
      score2iAboveAverage: user.scoregame2i - averageScores[0].avgScoreGame2i,
      score3dAboveAverage: user.scoregame3d - averageScores[0].avgScoreGame3d,
      score3iAboveAverage: user.scoregame3i - averageScores[0].avgScoreGame3i,
    }));

    // Función de comparación personalizada para manejar NaN
    const compareNumbers = (a, b) => {
      if (isNaN(a) && isNaN(b)) {
        return 0;
      } else if (isNaN(a)) {
        return -1;
      } else if (isNaN(b)) {
        return 1;
      }
      return a - b;
    };
    
    // Ordenar los usuarios por su puntuación en cada juego
    const sortedUsers = scoresAboveAverage.sort((a, b) => {
      return compareNumbers(b.score1dAboveAverage, a.score1dAboveAverage);
    });
     
    
    // Asignar un rango a cada usuario
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Buscar el rango del usuario actual en cada juego
    const currentRankingUser = rankedUsers.find((user) => {
      console.log('user._id:', user._id);
      console.log('userId:', userId);
      return user._id.equals(userId) ;
     });

    rankingUser = currentRankingUser.rank;
     
    res.render('resultados-edad', { rangoEdad, scoresAboveAverage, usersInRange, sortedUsers, averageScores, rankedUsers, currentUserRankings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
