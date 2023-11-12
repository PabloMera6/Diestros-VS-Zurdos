const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://pabmergom:2002@cluster0.odgnvyk.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  if (err) {
    console.error('Error al conectar a MongoDB:', err);
  } else {
    console.log('Conectado a MongoDB');
  }
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/form.html', (req, res) => {
  res.sendFile('form.html', { root: 'public' });
});

app.post('/guardarDatos', (req, res) => {
  const datosFormulario = {
    edad: req.body.edad,
    manoHabil: req.body.manoHabil,
    manoMovil: req.body.manoMovil,
    horasUsoMovil: req.body.horasUsoMovil
  };

  const collection = client.db('Juego').collection('Usuario');
  collection.insertOne(datosFormulario, (err, result) => {
    if (err) {
      console.error('Error al insertar en MongoDB:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      console.log('Datos del formulario insertados en MongoDB:', result.ops[0]);
      res.sendFile('index.html', { root: 'public' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
