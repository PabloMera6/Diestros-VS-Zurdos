const { MongoClient, ObjectId } = require("mongodb");

const express = require("express");
const BodyParser = require("body-parser");
const Cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');

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
server.use(cookieParser());
server.set('view engine', 'ejs');

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let collection;

async function setupDatabase(collectionName) {
  try {
    await client.connect();
    collection = client.db("Juego").collection(collectionName);
  } catch (e) {
    console.error("Error al conectar y configurar la base de datos", e);
  }
}

// Llamar a la función de configuración de la base de datos al iniciar el servidor
setupDatabase("Usuario").then(() => {
  server.listen("3000", () => {
    console.log("Listening at :3000...");
  });
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
  if (data.nombre.length < 3 || data.nombre.length > 15) {
    throw new Error('El nombre debe tener entre 3 y 15 caracteres.');
  }

  if (isNaN(data.edad) || data.edad < 3 || data.edad > 99) {
    throw new Error('La edad debe estar entre 3 y 99 años.');
  }

  if (data.manoHabil !== 'derecha' && data.manoHabil !== 'izquierda') {
    throw new Error('La mano hábil debe ser derecha o izquierda.');
  }

  if (data.manoUso !== 'derecha' && data.manoUso !== 'izquierda') {
    throw new Error('La mano de uso debe ser derecha o izquierda.');
  }

  if(data.horasUsoMovil !== '<1' && data.horasUsoMovil !== '1-3' && data.horasUsoMovil !== '3-5' && data.horasUsoMovil !== '5-8' && data.horasUsoMovil !== '>8') {
    throw new Error('Las horas de uso del móvil deben ser las especificadas.');
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

    //Añadir a las cookies durante 1 día
    response.cookie('userId', userId, { maxAge: 86400000 });

    // Redirigir al usuario a la URL /menu después del registro exitoso
    response.status(200).json({ redirect: '/menu' , userId: userId});
  } catch (error) {
    // Manejar errores específicos y enviar respuestas adecuadas
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    }

    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.get('/menu', async (req, res) => {
  let conectado = false;
  let mostrar_resultados = false;
  let juego1_done = false;
  let juego2_done = false;
  let juego3_done = false;
  let completedGamesCount = 0;
  const userId = new ObjectId(req.cookies.userId);
  const userExist = await collection.findOne({ _id: userId });
  if(userExist) {
    conectado = true;
  }
  const userDataGame1 = await collection.findOne({ 
    _id: userId, 
    scoregame1d: { $exists: true },
    scoregame1i: { $exists: true },
  });
 
  const userDataGame2 = await collection.findOne({
    _id: userId,
    scoregame2d: { $exists: true },
    scoregame2i: { $exists: true },
  });
 
  const userDataGame3 = await collection.findOne({
    _id: userId,
    scoregame3d: { $exists: true },
    scoregame3i: { $exists: true },
  });
 
  if (userDataGame1) {
    juego1_done = true;
    completedGamesCount++;
  }
 
  if (userDataGame2) {
    juego2_done = true;
    completedGamesCount++;
  }
 
  if (userDataGame3) {
    juego3_done = true;
    completedGamesCount++;
  }
  
  if(juego1_done && juego2_done && juego3_done) {
    mostrar_resultados = true;
  }
   
  res.render('menu', { conectado, mostrar_resultados, juego1_done, juego2_done, juego3_done, completedGamesCount });
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
    const userId = new ObjectId(request.cookies.userId);
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave1-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.cookies.userId);
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

async function calculateResultsGame1(userId) {
  const userData = await collection.findOne({ _id: userId });
  if (!userData) {
    throw new Error('Usuario no encontrado');
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

  return { datosUsuario1: userData.scoregame1d, datosUsuario2: userData.scoregame1i, datosMedia1: porcentajeRespectoMediaDerecha, datosMedia2: porcentajeRespectoMediaIzquierda };
}

server.get('/resultados1', async (req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const datos = await calculateResultsGame1(userId);

    res.render('resultados', { datosUsuario1: datos.datosUsuario1, datosUsuario2: datos.datosUsuario2, datosMedia1: datos.datosMedia1, datosMedia2: datos.datosMedia2 });
  } catch (error) {
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
    const userId = new ObjectId(request.cookies.userId);
    const { scoregame2d } = request.body;
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave2-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.cookies.userId);
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

async function calculateResultsGame2(userId) {
  const userData = await collection.findOne({ _id: userId });
  if (!userData) {
    throw new Error('Usuario no encontrado');
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

  return { datosUsuario1: userData.scoregame2d, datosUsuario2: userData.scoregame2i, datosMedia2d: porcentajeRespectoMediaDerecha, datosMedia2i: porcentajeRespectoMediaIzquierda };
}

server.get('/resultados2', async (req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const datos = await calculateResultsGame2(userId);

    res.render('resultados2', { datosUsuario2d: datos.datosUsuario1, datosUsuario2i: datos.datosUsuario2, datosMedia2d: datos.datosMedia2d, datosMedia2i: datos.datosMedia2i });
  } catch (error) {
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
    const userId = new ObjectId(request.cookies.userId);
    const { scoregame3d } = request.body;
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

server.post("/gamesave3-b", async (request, response, next) => {
  try {
    const userId = new ObjectId(request.cookies.userId);
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
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

async function calculateResultsGame3(userId) {
  const userData = await collection.findOne({ _id: userId });
  if (!userData) {
    throw new Error('Usuario no encontrado');
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

  return { datosUsuario1: userData.scoregame3d, datosUsuario2: userData.scoregame3i, datosMedia3d: porcentajeRespectoMediaDerecha, datosMedia3i: porcentajeRespectoMediaIzquierda };
}

server.get('/resultados3', async (req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const datos = await calculateResultsGame3(userId);

    res.render('resultados3', { datosUsuario3d: datos.datosUsuario1, datosUsuario3i: datos.datosUsuario2, datosMedia3d: datos.datosMedia3d, datosMedia3i: datos.datosMedia3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/resultados-finales', (req, res) => {
  const indexPath = path.join(__dirname, 'src/resultados/resultados-finales.html');
  res.sendFile(indexPath);
});


const compareNumbers1and3 = (a, b) => {
  if (isNaN(a) && isNaN(b)) {
    return 0;
  } else if (isNaN(a)) {
    return -1;
  } else if (isNaN(b)) {
    return 1;
  }
  return a - b;
};

const compareNumbers2 = (a, b) => {
  if (isNaN(a) && isNaN(b)) {
    return 0;
  } else if (isNaN(a)) {
    return -1;
  } else if (isNaN(b)) {
    return 1;
  }
  return b - a;
};

// Función para clasificar usuarios por puntuación en un juego
function sortByScore(users, scoreKey, compareFunction) {
  return users.sort((a, b) => compareFunction(b[scoreKey], a[scoreKey]));
}

// Función para asignar rangos a usuarios en un juego
function assignRanks(users, scoreKey) {
  return users.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
}

async function calculateAge(edad_usuario) {
  let rangoEdad;
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
  return rangoEdad;
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

server.get('/resultados-edad', async(req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
     
    const edad_usuario = userData.edad;
    let rangoEdad = await calculateAge(edad_usuario);

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
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 2000] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 2000] } },
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

    // Busca al usuario actual en scoresAboveAverage
    const currentUserScores = scoresAboveAverage.find(user => user._id.equals(userId));

    if (!currentUserScores) {
      throw new Error('No se encontró al usuario actual');
    }

    // Extrae los puntajes por encima de la media del usuario actual
    const userScoreAboveAverage = {
      score1dAboveAverage: currentUserScores.score1dAboveAverage,
      score1iAboveAverage: currentUserScores.score1iAboveAverage,
      score2dAboveAverage: currentUserScores.score2dAboveAverage,
      score2iAboveAverage: currentUserScores.score2iAboveAverage,
      score3dAboveAverage: currentUserScores.score3dAboveAverage,
      score3iAboveAverage: currentUserScores.score3iAboveAverage,
    };

    // Clasificar usuarios por puntuación en cada juego
    const sortedUsers1d = sortByScore(scoresAboveAverage, 'score1dAboveAverage', compareNumbers1and3);
    const rankedUsers1d = assignRanks(sortedUsers1d, 'score1dAboveAverage');
    const rankingUser1d = rankedUsers1d.find((user) => user._id.equals(userId));

    const sortedUsers1i = sortByScore(scoresAboveAverage, 'score1iAboveAverage', compareNumbers1and3);
    const rankedUsers1i = assignRanks(sortedUsers1i, 'score1iAboveAverage');
    const rankingUser1i = rankedUsers1i.find((user) => user._id.equals(userId));

    const sortedUsers2d = sortByScore(scoresAboveAverage, 'score2dAboveAverage', compareNumbers2);
    const rankedUsers2d = assignRanks(sortedUsers2d, 'score2dAboveAverage');
    const rankingUser2d = rankedUsers2d.find((user) => user._id.equals(userId));

    const sortedUsers2i = sortByScore(scoresAboveAverage, 'score2iAboveAverage', compareNumbers2);
    const rankedUsers2i = assignRanks(sortedUsers2i, 'score2iAboveAverage');
    const rankingUser2i = rankedUsers2i.find((user) => user._id.equals(userId));

    const sortedUsers3d = sortByScore(scoresAboveAverage, 'score3dAboveAverage', compareNumbers1and3);
    const rankedUsers3d = assignRanks(sortedUsers3d, 'score3dAboveAverage');
    const rankingUser3d = rankedUsers3d.find((user) => user._id.equals(userId));

    const sortedUsers3i = sortByScore(scoresAboveAverage, 'score3iAboveAverage', compareNumbers1and3);
    const rankedUsers3i = assignRanks(sortedUsers3i, 'score3iAboveAverage');
    const rankingUser3i = rankedUsers3i.find((user) => user._id.equals(userId));

    res.render('resultados-edad', { rangoEdad, userScoreAboveAverage, usersInRange, averageScores, rankingUser1d, rankingUser1i, rankingUser2d, rankingUser2i, rankingUser3d, rankingUser3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/resultados-mano-habil', async(req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
  
    const mano_habil_usuario = userData.manoHabil;
    
    const usersManoHabil = await collection.find({
      manoHabil: mano_habil_usuario
     }).toArray();

    const averageScores = await collection.aggregate([
    {
    $match: { manoHabil: mano_habil_usuario  },
    },
    {
    $group: {
      _id: null,
      avgScoreGame1d: { $avg: { $ifNull: ['$scoregame1d', 0] } },
      avgScoreGame1i: { $avg: { $ifNull: ['$scoregame1i', 0] } },
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 2000] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 2000] } },
      avgScoreGame3d: { $avg: { $ifNull: ['$scoregame3d', 0] } },
      avgScoreGame3i: { $avg: { $ifNull: ['$scoregame3i', 0] } },
    },
    },
    ]).toArray();

    // Calcular la puntuación de cada usuario por encima de la media para cada juego
    const scoresAboveAverage = usersManoHabil.map((user) => ({
      ...user,
      score1dAboveAverage: user.scoregame1d - averageScores[0].avgScoreGame1d,
      score1iAboveAverage: user.scoregame1i - averageScores[0].avgScoreGame1i,
      score2dAboveAverage: user.scoregame2d - averageScores[0].avgScoreGame2d,
      score2iAboveAverage: user.scoregame2i - averageScores[0].avgScoreGame2i,
      score3dAboveAverage: user.scoregame3d - averageScores[0].avgScoreGame3d,
      score3iAboveAverage: user.scoregame3i - averageScores[0].avgScoreGame3i,
    }));

    // Busca al usuario actual en scoresAboveAverage
    const currentUserScores = scoresAboveAverage.find(user => user._id.equals(userId));

    if (!currentUserScores) {
      throw new Error('No se encontró al usuario actual');
    }

    // Extrae los puntajes por encima de la media del usuario actual
    const userScoreAboveAverage = {
      score1dAboveAverage: currentUserScores.score1dAboveAverage,
      score1iAboveAverage: currentUserScores.score1iAboveAverage,
      score2dAboveAverage: currentUserScores.score2dAboveAverage,
      score2iAboveAverage: currentUserScores.score2iAboveAverage,
      score3dAboveAverage: currentUserScores.score3dAboveAverage,
      score3iAboveAverage: currentUserScores.score3iAboveAverage,
    };

    // Clasificar usuarios por puntuación en cada juego
    const sortedUsers1d = sortByScore(scoresAboveAverage, 'score1dAboveAverage', compareNumbers1and3);
    const rankedUsers1d = assignRanks(sortedUsers1d, 'score1dAboveAverage');
    const rankingUser1d = rankedUsers1d.find((user) => user._id.equals(userId));

    const sortedUsers1i = sortByScore(scoresAboveAverage, 'score1iAboveAverage', compareNumbers1and3);
    const rankedUsers1i = assignRanks(sortedUsers1i, 'score1iAboveAverage');
    const rankingUser1i = rankedUsers1i.find((user) => user._id.equals(userId));

    const sortedUsers2d = sortByScore(scoresAboveAverage, 'score2dAboveAverage', compareNumbers2);
    const rankedUsers2d = assignRanks(sortedUsers2d, 'score2dAboveAverage');
    const rankingUser2d = rankedUsers2d.find((user) => user._id.equals(userId));

    const sortedUsers2i = sortByScore(scoresAboveAverage, 'score2iAboveAverage', compareNumbers2);
    const rankedUsers2i = assignRanks(sortedUsers2i, 'score2iAboveAverage');
    const rankingUser2i = rankedUsers2i.find((user) => user._id.equals(userId));

    const sortedUsers3d = sortByScore(scoresAboveAverage, 'score3dAboveAverage', compareNumbers1and3);
    const rankedUsers3d = assignRanks(sortedUsers3d, 'score3dAboveAverage');
    const rankingUser3d = rankedUsers3d.find((user) => user._id.equals(userId));

    const sortedUsers3i = sortByScore(scoresAboveAverage, 'score3iAboveAverage', compareNumbers1and3);
    const rankedUsers3i = assignRanks(sortedUsers3i, 'score3iAboveAverage');
    const rankingUser3i = rankedUsers3i.find((user) => user._id.equals(userId));

    res.render('resultados-mano-habil', { mano_habil_usuario, userScoreAboveAverage, usersManoHabil, averageScores, rankingUser1d, rankingUser1i, rankingUser2d, rankingUser2i, rankingUser3d, rankingUser3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/resultados-mano-uso', async(req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
  
    const mano_uso_usuario = userData.manoUso;
    
    const usersManoUso = await collection.find({
      manoUso: mano_uso_usuario
     }).toArray();

    const averageScores = await collection.aggregate([
    {
    $match: { manoUso: mano_uso_usuario  },
    },
    {
    $group: {
      _id: null,
      avgScoreGame1d: { $avg: { $ifNull: ['$scoregame1d', 0] } },
      avgScoreGame1i: { $avg: { $ifNull: ['$scoregame1i', 0] } },
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 2000] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 2000] } },
      avgScoreGame3d: { $avg: { $ifNull: ['$scoregame3d', 0] } },
      avgScoreGame3i: { $avg: { $ifNull: ['$scoregame3i', 0] } },
    },
    },
    ]).toArray();

    // Calcular la puntuación de cada usuario por encima de la media para cada juego
    const scoresAboveAverage = usersManoUso.map((user) => ({
      ...user,
      score1dAboveAverage: user.scoregame1d - averageScores[0].avgScoreGame1d,
      score1iAboveAverage: user.scoregame1i - averageScores[0].avgScoreGame1i,
      score2dAboveAverage: user.scoregame2d - averageScores[0].avgScoreGame2d,
      score2iAboveAverage: user.scoregame2i - averageScores[0].avgScoreGame2i,
      score3dAboveAverage: user.scoregame3d - averageScores[0].avgScoreGame3d,
      score3iAboveAverage: user.scoregame3i - averageScores[0].avgScoreGame3i,
    }));

    // Busca al usuario actual en scoresAboveAverage
    const currentUserScores = scoresAboveAverage.find(user => user._id.equals(userId));

    if (!currentUserScores) {
      throw new Error('No se encontró al usuario actual');
    }

    // Extrae los puntajes por encima de la media del usuario actual
    const userScoreAboveAverage = {
      score1dAboveAverage: currentUserScores.score1dAboveAverage,
      score1iAboveAverage: currentUserScores.score1iAboveAverage,
      score2dAboveAverage: currentUserScores.score2dAboveAverage,
      score2iAboveAverage: currentUserScores.score2iAboveAverage,
      score3dAboveAverage: currentUserScores.score3dAboveAverage,
      score3iAboveAverage: currentUserScores.score3iAboveAverage,
    };

    // Clasificar usuarios por puntuación en cada juego
    const sortedUsers1d = sortByScore(scoresAboveAverage, 'score1dAboveAverage', compareNumbers1and3);
    const rankedUsers1d = assignRanks(sortedUsers1d, 'score1dAboveAverage');
    const rankingUser1d = rankedUsers1d.find((user) => user._id.equals(userId));

    const sortedUsers1i = sortByScore(scoresAboveAverage, 'score1iAboveAverage', compareNumbers1and3);
    const rankedUsers1i = assignRanks(sortedUsers1i, 'score1iAboveAverage');
    const rankingUser1i = rankedUsers1i.find((user) => user._id.equals(userId));

    const sortedUsers2d = sortByScore(scoresAboveAverage, 'score2dAboveAverage', compareNumbers2);
    const rankedUsers2d = assignRanks(sortedUsers2d, 'score2dAboveAverage');
    const rankingUser2d = rankedUsers2d.find((user) => user._id.equals(userId));

    const sortedUsers2i = sortByScore(scoresAboveAverage, 'score2iAboveAverage', compareNumbers2);
    const rankedUsers2i = assignRanks(sortedUsers2i, 'score2iAboveAverage');
    const rankingUser2i = rankedUsers2i.find((user) => user._id.equals(userId));

    const sortedUsers3d = sortByScore(scoresAboveAverage, 'score3dAboveAverage', compareNumbers1and3);
    const rankedUsers3d = assignRanks(sortedUsers3d, 'score3dAboveAverage');
    const rankingUser3d = rankedUsers3d.find((user) => user._id.equals(userId));

    const sortedUsers3i = sortByScore(scoresAboveAverage, 'score3iAboveAverage', compareNumbers1and3);
    const rankedUsers3i = assignRanks(sortedUsers3i, 'score3iAboveAverage');
    const rankingUser3i = rankedUsers3i.find((user) => user._id.equals(userId));

    res.render('resultados-mano-uso', { mano_uso_usuario, userScoreAboveAverage, usersManoUso, averageScores, rankingUser1d, rankingUser1i, rankingUser2d, rankingUser2i, rankingUser3d, rankingUser3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

function getHorasUsoTexto(horas_uso_usuario) {
  let horas_uso_usuario_texto;
  switch (horas_uso_usuario) {
    case '<1':
      horas_uso_usuario_texto = 'menos de 1 hora';
      break;
    case '1-3':
      horas_uso_usuario_texto = 'entre 1 y 3 horas';
      break;
    case '3-5':
      horas_uso_usuario_texto = 'entre 3 y 5 horas';
      break;
    case '5-8':
      horas_uso_usuario_texto = 'entre 5 y 8 horas';
      break;
    case '>8':
      horas_uso_usuario_texto = 'más de 8 horas';
      break;
    default:
      horas_uso_usuario_texto = 'no especificado';
  }
  return horas_uso_usuario_texto;
}


server.get('/resultados-horas-uso', async(req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
  
    const horas_uso_usuario = userData.horasUsoMovil;
    const horas_uso_usuario_texto = getHorasUsoTexto(horas_uso_usuario);

    const usersHorasUso = await collection.find({
      horasUsoMovil: horas_uso_usuario
     }).toArray();

    const averageScores = await collection.aggregate([
    {
    $match: { horasUsoMovil: horas_uso_usuario  },
    },
    {
    $group: {
      _id: null,
      avgScoreGame1d: { $avg: { $ifNull: ['$scoregame1d', 0] } },
      avgScoreGame1i: { $avg: { $ifNull: ['$scoregame1i', 0] } },
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 2000] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 2000] } },
      avgScoreGame3d: { $avg: { $ifNull: ['$scoregame3d', 0] } },
      avgScoreGame3i: { $avg: { $ifNull: ['$scoregame3i', 0] } },
    },
    },
    ]).toArray();

    // Calcular la puntuación de cada usuario por encima de la media para cada juego
    const scoresAboveAverage = usersHorasUso.map((user) => ({
      ...user,
      score1dAboveAverage: user.scoregame1d - averageScores[0].avgScoreGame1d,
      score1iAboveAverage: user.scoregame1i - averageScores[0].avgScoreGame1i,
      score2dAboveAverage: user.scoregame2d - averageScores[0].avgScoreGame2d,
      score2iAboveAverage: user.scoregame2i - averageScores[0].avgScoreGame2i,
      score3dAboveAverage: user.scoregame3d - averageScores[0].avgScoreGame3d,
      score3iAboveAverage: user.scoregame3i - averageScores[0].avgScoreGame3i,
    }));

    // Busca al usuario actual en scoresAboveAverage
    const currentUserScores = scoresAboveAverage.find(user => user._id.equals(userId));

    if (!currentUserScores) {
      throw new Error('No se encontró al usuario actual');
    }

    // Extrae los puntajes por encima de la media del usuario actual
    const userScoreAboveAverage = {
      score1dAboveAverage: currentUserScores.score1dAboveAverage,
      score1iAboveAverage: currentUserScores.score1iAboveAverage,
      score2dAboveAverage: currentUserScores.score2dAboveAverage,
      score2iAboveAverage: currentUserScores.score2iAboveAverage,
      score3dAboveAverage: currentUserScores.score3dAboveAverage,
      score3iAboveAverage: currentUserScores.score3iAboveAverage,
    };

    // Clasificar usuarios por puntuación en cada juego
    const sortedUsers1d = sortByScore(scoresAboveAverage, 'score1dAboveAverage', compareNumbers1and3);
    const rankedUsers1d = assignRanks(sortedUsers1d, 'score1dAboveAverage');
    const rankingUser1d = rankedUsers1d.find((user) => user._id.equals(userId));

    const sortedUsers1i = sortByScore(scoresAboveAverage, 'score1iAboveAverage', compareNumbers1and3);
    const rankedUsers1i = assignRanks(sortedUsers1i, 'score1iAboveAverage');
    const rankingUser1i = rankedUsers1i.find((user) => user._id.equals(userId));

    const sortedUsers2d = sortByScore(scoresAboveAverage, 'score2dAboveAverage', compareNumbers2);
    const rankedUsers2d = assignRanks(sortedUsers2d, 'score2dAboveAverage');
    const rankingUser2d = rankedUsers2d.find((user) => user._id.equals(userId));

    const sortedUsers2i = sortByScore(scoresAboveAverage, 'score2iAboveAverage', compareNumbers2);
    const rankedUsers2i = assignRanks(sortedUsers2i, 'score2iAboveAverage');
    const rankingUser2i = rankedUsers2i.find((user) => user._id.equals(userId));

    const sortedUsers3d = sortByScore(scoresAboveAverage, 'score3dAboveAverage', compareNumbers1and3);
    const rankedUsers3d = assignRanks(sortedUsers3d, 'score3dAboveAverage');
    const rankingUser3d = rankedUsers3d.find((user) => user._id.equals(userId));

    const sortedUsers3i = sortByScore(scoresAboveAverage, 'score3iAboveAverage', compareNumbers1and3);
    const rankedUsers3i = assignRanks(sortedUsers3i, 'score3iAboveAverage');
    const rankingUser3i = rankedUsers3i.find((user) => user._id.equals(userId));

    res.render('resultados-horas-uso', { horas_uso_usuario_texto, userScoreAboveAverage, usersHorasUso, averageScores, rankingUser1d, rankingUser1i, rankingUser2d, rankingUser2i, rankingUser3d, rankingUser3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

server.get('/resultados-generales', async(req, res) => {
  try {
    const userId = new ObjectId(req.cookies.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const userData = await collection.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
  
    const usersActuales = await collection.find({
     }).toArray();

    const averageScores = await collection.aggregate([
    {
    $group: {
      _id: null,
      avgScoreGame1d: { $avg: { $ifNull: ['$scoregame1d', 0] } },
      avgScoreGame1i: { $avg: { $ifNull: ['$scoregame1i', 0] } },
      avgScoreGame2d: { $avg: { $ifNull: ['$scoregame2d', 2000] } },
      avgScoreGame2i: { $avg: { $ifNull: ['$scoregame2i', 2000] } },
      avgScoreGame3d: { $avg: { $ifNull: ['$scoregame3d', 0] } },
      avgScoreGame3i: { $avg: { $ifNull: ['$scoregame3i', 0] } },
    },
    },
    ]).toArray();

    // Calcular la puntuación de cada usuario por encima de la media para cada juego
    const scoresAboveAverage = usersActuales.map((user) => ({
      ...user,
      score1dAboveAverage: user.scoregame1d - averageScores[0].avgScoreGame1d,
      score1iAboveAverage: user.scoregame1i - averageScores[0].avgScoreGame1i,
      score2dAboveAverage: user.scoregame2d - averageScores[0].avgScoreGame2d,
      score2iAboveAverage: user.scoregame2i - averageScores[0].avgScoreGame2i,
      score3dAboveAverage: user.scoregame3d - averageScores[0].avgScoreGame3d,
      score3iAboveAverage: user.scoregame3i - averageScores[0].avgScoreGame3i,
    }));

    // Busca al usuario actual en scoresAboveAverage
    const currentUserScores = scoresAboveAverage.find(user => user._id.equals(userId));

    if (!currentUserScores) {
      throw new Error('No se encontró al usuario actual');
    }

    // Extrae los puntajes por encima de la media del usuario actual
    const userScoreAboveAverage = {
      score1dAboveAverage: currentUserScores.score1dAboveAverage,
      score1iAboveAverage: currentUserScores.score1iAboveAverage,
      score2dAboveAverage: currentUserScores.score2dAboveAverage,
      score2iAboveAverage: currentUserScores.score2iAboveAverage,
      score3dAboveAverage: currentUserScores.score3dAboveAverage,
      score3iAboveAverage: currentUserScores.score3iAboveAverage,
    };

    // Clasificar usuarios por puntuación en cada juego
    const sortedUsers1d = sortByScore(scoresAboveAverage, 'score1dAboveAverage', compareNumbers1and3);
    const rankedUsers1d = assignRanks(sortedUsers1d, 'score1dAboveAverage');
    const rankingUser1d = rankedUsers1d.find((user) => user._id.equals(userId));

    const sortedUsers1i = sortByScore(scoresAboveAverage, 'score1iAboveAverage', compareNumbers1and3);
    const rankedUsers1i = assignRanks(sortedUsers1i, 'score1iAboveAverage');
    const rankingUser1i = rankedUsers1i.find((user) => user._id.equals(userId));

    const sortedUsers2d = sortByScore(scoresAboveAverage, 'score2dAboveAverage', compareNumbers2);
    const rankedUsers2d = assignRanks(sortedUsers2d, 'score2dAboveAverage');
    const rankingUser2d = rankedUsers2d.find((user) => user._id.equals(userId));

    const sortedUsers2i = sortByScore(scoresAboveAverage, 'score2iAboveAverage', compareNumbers2);
    const rankedUsers2i = assignRanks(sortedUsers2i, 'score2iAboveAverage');
    const rankingUser2i = rankedUsers2i.find((user) => user._id.equals(userId));

    const sortedUsers3d = sortByScore(scoresAboveAverage, 'score3dAboveAverage', compareNumbers1and3);
    const rankedUsers3d = assignRanks(sortedUsers3d, 'score3dAboveAverage');
    const rankingUser3d = rankedUsers3d.find((user) => user._id.equals(userId));

    const sortedUsers3i = sortByScore(scoresAboveAverage, 'score3iAboveAverage', compareNumbers1and3);
    const rankedUsers3i = assignRanks(sortedUsers3i, 'score3iAboveAverage');
    const rankingUser3i = rankedUsers3i.find((user) => user._id.equals(userId));

    res.render('resultados-generales', { usersActuales, userScoreAboveAverage, averageScores, rankingUser1d, rankingUser1i, rankingUser2d, rankingUser2i, rankingUser3d, rankingUser3i });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = {server, setupDatabase, collection, client, calculateResultsGame1, calculateResultsGame2, calculateResultsGame3, sortByScore, compareNumbers1and3, compareNumbers2, calculateAge, getHorasUsoTexto};
