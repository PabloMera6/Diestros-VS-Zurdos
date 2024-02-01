const request = require('supertest');
const session = require('supertest-session');
const {server, setupDatabase, client, calculateResultsGame1, calculateResultsGame2, calculateResultsGame3, sortByScore, compareNumbers1and3, compareNumbers2, calculateAge, getHorasUsoTexto}= require('../main.js');
const cheerio = require('cheerio');
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://pabmergom:2002@cluster0.odgnvyk.mongodb.net/';


describe('Pruebas para el servidor', () => {
  let testSession = null;
  let savedUserId;
  let client;
  let collection;

  beforeAll(async () => {
    testSession = session(server);
    client = new MongoClient(uri);
    await client.connect();
    await setupDatabase('UsuarioTest');
    collection = client.db("Juego").collection('UsuarioTest');
  });

  afterAll(async () => {
    await collection.deleteMany({}); // Eliminar todos los documentos de la colección al finalizar las pruebas
    await client.close();
  });
  

  it('debería responder correctamente a la ruta /', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
  });

  it('debería responder correctamente "Rellenar mis datos" en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await testSession.get('/menu');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Rellenar mis datos');
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: false, juego2_done: false, juego3_done: false, mostrar_resultados: false, conectado: false  }));
    renderSpy.mockRestore();
  });

  describe('Pruebas para el formulario', () => {
    it('debería responder correctamente a la ruta /form', async () => {
      const response = await request(server).get('/form');
      expect(response.status).toBe(200);
    });

    it('debería manejar correctamente el formulario', async () => {
      const data = {
        nombre: 'Test',
        edad: 25,
        manoHabil: 'derecha',
        manoUso: 'derecha',
        horasUsoMovil: '1-3',
      };
    
      const response = await testSession.post('/form').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ redirect: '/menu' , userId: expect.anything()});
      savedUserId = response.body.userId;
    });

    it('debería manejar error por nombre en el formulario', async () => {
      const data = {
        nombre: 'Te',
        edad: 33,
        manoHabil: 'derecha',
        manoUso: 'derecha',
        horasUsoMovil: '1-3',
      };

      const response = await request(server).post('/form').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'El nombre debe tener entre 3 y 15 caracteres.' });
    });

    it('debería manejar error por edad en el formulario', async () => {
      const data = {
        nombre: 'Ana',
        edad: 2,
        manoHabil: 'derecha',
        manoUso: 'derecha',
        horasUsoMovil: '1-3',
      };

      const response = await request(server).post('/form').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'La edad debe estar entre 3 y 99 años.' });

    });

    it('debería manejar error por mano hábil en el formulario', async () => {
      const data = {
        nombre: 'Ana',
        edad: 33,
        manoHabil: '',
        manoUso: 'derecha',
        horasUsoMovil: '1-3',
      };
    
      const response = await request(server).post('/form').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'La mano hábil debe ser derecha o izquierda.' });
    });
    
    it('debería manejar error por mano de uso en el formulario', async () => {
      const data = {
        nombre: 'Ana',
        edad: 33,
        manoHabil: 'derecha',
        manoUso: '',
        horasUsoMovil: '1-3',
      };
    
      const response = await request(server).post('/form').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'La mano de uso debe ser derecha o izquierda.' });
    });
    
    it('debería manejar error por horas de uso del móvil en el formulario', async () => {
      const data = {
        nombre: 'Ana',
        edad: 33,
        manoHabil: 'derecha',
        manoUso: 'derecha',
        horasUsoMovil: '',
      };
    
      const response = await request(server).post('/form').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Las horas de uso del móvil deben ser las especificadas.' });
    });
  });
  

  it('debería responder correctamente 0/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await testSession.get('/menu');
    expect(response.status).toBe(200);
    expect(response.text).toContain('0/3');
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: false, juego2_done: false, juego3_done: false, mostrar_resultados: false, conectado: true  }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-1', async () => {
    const response = await request(server).get('/introduccion-1');
    expect(response.text).toContain('Comenzar a jugar');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game1', async () => {
    const response = await request(server).get('/game1');
    expect(response.status).toBe(200);
  });

  describe('Pruebas para guardar datos juego 1', () => {
    it('debería manejar correctamente el guardado del juego 1 (parte a)', async () => {
      const data = {
        scoregame1d: 100,
      };
      const response = await testSession.post('/gamesave1-a').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 1 (parte a)', async () => {
      const data = {
        scoregame1d: 'no es un número',
      };
      const response = await testSession.post('/gamesave1-a').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });

    it('debería manejar correctamente el guardado del juego 1 (parte b)', async () => {
      const data = {
        scoregame1i: 100,
      };
      const response = await testSession.post('/gamesave1-b').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 1 (parte b)', async () => {
      const data = {
        scoregame1i: 'no es un número',
      };
      const response = await testSession.post('/gamesave1-b').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });
  });

  it('debería manejar correctamente la ruta /resultados1', async () => {
    const response = await testSession.get('/resultados1');
    expect(response.status).toBe(200);
    savedUserId = new ObjectId(savedUserId);
    const results = await calculateResultsGame1(savedUserId);
    expect(results.datosUsuario1).toBe(100);
    expect(results.datosUsuario2).toBe(100);
    expect(results.datosMedia1).toBe(0);
    expect(results.datosMedia2).toBe(0);
  });

  it('debería lanzar un error al pasar un userId inexistente', async () => {
    await expect(calculateResultsGame1('5f9f9f9f9f9f9f9f9f9f9f9f')).rejects.toThrow('Usuario no encontrado');
  });
  

  it('debería responder correctamente 1/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await testSession.get('/menu');
    expect(response.status).toBe(200);
    expect(response.text).toContain('1/3');
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: false, juego3_done: false, mostrar_resultados: false, conectado: true }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-2', async () => {
    const response = await request(server).get('/introduccion-2');
    expect(response.text).toContain('Comenzar a jugar');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game2', async () => {
    const response = await request(server).get('/game2');
    expect(response.status).toBe(200);
  });

  describe('Pruebas para guardar datos juego 2', () => {
    it('debería manejar correctamente el guardado del juego 2 (parte a)', async () => {
      const data = {
        scoregame2d: 250.90,
      };

      const response = await testSession.post('/gamesave2-a').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 2 (parte a)', async () => {
      const data = {
        scoregame2d: 'no es un número',
      };
      const response = await testSession.post('/gamesave2-a').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });

    it('debería manejar correctamente el guardado del juego 2 (parte b)', async () => {
      const data = {
        scoregame2i: 250.90,
      };

      const response = await testSession.post('/gamesave2-b').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 2 (parte b)', async () => {
      const data = {
        scoregame2i: 'no es un número',
      };
      const response = await testSession.post('/gamesave2-b').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });
  });

  it('debería manejar correctamente la ruta /resultados2', async () => {
    const response = await testSession.get('/resultados2');
    expect(response.status).toBe(200);
    savedUserId = new ObjectId(savedUserId);
    const results = await calculateResultsGame2(savedUserId);
    expect(results.datosUsuario1).toBe(250.90);
    expect(results.datosUsuario2).toBe(250.90);
    expect(results.datosMedia2d).toBe(0);
    expect(results.datosMedia2i).toBe(0);
  });

  it('debería lanzar un error en la función calculateResultsGame2 al pasar un userId inexistente', async () => {
    await expect(calculateResultsGame2('5f9f9f9f9f9f9f9f9f9f9f9f')).rejects.toThrow('Usuario no encontrado');
  });

  it('debería responder correctamente 2/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await testSession.get('/menu');
    expect(response.status).toBe(200);
    expect(response.text).toContain('2/3');
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: true, juego3_done: false, mostrar_resultados: false, conectado: true }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-3', async () => {
    const response = await request(server).get('/introduccion-3');
    expect(response.text).toContain('Comenzar a jugar');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game3', async () => {
    const response = await request(server).get('/game3');
    expect(response.status).toBe(200);
  });

  describe('Pruebas para guardar datos juego 3', () => {
    it('debería manejar correctamente el guardado del juego 3 (parte a)', async () => {
      const data = {
        scoregame3d: 10204.10,
      };

      const response = await testSession.post('/gamesave3-a').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 3 (parte a)', async () => {
      const data = {
        scoregame3d: 'no es un número',
      };
      const response = await testSession.post('/gamesave3-a').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });

    it('debería manejar correctamente el guardado del juego 3 (parte b)', async () => {
      const data = {
        scoregame3i: 10204.10,
      };

      const response = await testSession.post('/gamesave3-b').send(data);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
    });

    it('debería devolver un error 400 si los parámetros son incorrectos en el guardado del juego 3 (parte b)', async () => {
      const data = {
        scoregame3i: 'no es un número',
      };
      const response = await testSession.post('/gamesave3-b').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Parámetros incorrectos.' });
    });

  });
  
  it('debería manejar correctamente la ruta /resultados3', async () => {
    const response = await testSession.get('/resultados3');
    expect(response.status).toBe(200);
    savedUserId = new ObjectId(savedUserId);
    const results = await calculateResultsGame3(savedUserId);
    expect(results.datosUsuario1).toBe(10204.10);
    expect(results.datosUsuario2).toBe(10204.10);
    expect(results.datosMedia3d).toBe(0);
    expect(results.datosMedia3i).toBe(0);
  });

  it('debería lanzar un error en la función calculateResultsGame3 al pasar un userId inexistente', async () => {
    await expect(calculateResultsGame3('5f9f9f9f9f9f9f9f9f9f9f9f')).rejects.toThrow('Usuario no encontrado');
  });

  it('debería responder correctamente "Resultados Finales" en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await testSession.get('/menu');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Resultados Finales');
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: true, juego3_done: true, mostrar_resultados: true, conectado: true }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /resultados-edad', async () => {
    const response = await testSession.get('/resultados-edad');
    expect(response.status).toBe(200);
    const $ = cheerio.load(response.text);

    expect($('title').text()).toBe('Resultados por Edad');
    expect($('h2.orange-box')).toHaveLength(6);
    expect($('.ranking-number')).toHaveLength(6);
    expect($('.highlight')).toHaveLength(6);  
    
    // Verifica que los textos de reacción y coordinación estén presentes
    const texts = ['Velocidad (Derecha)', 'Velocidad (Izquierda)','Reacción (Derecha)', 'Reacción (Izquierda)', 'Coordinación (Derecha)', 'Coordinación (Izquierda)'];
    texts.forEach((text) => {
      expect($('body').text()).toContain(text);
    });

    // Verifica que los rankings sean correctos
    const expectedRanking = '1';
    $('.ranking-number').each((i, elem) => {
      expect($(elem).text()).toBe(expectedRanking);
    });

    // Verifica que el mensaje '¡Estás en la media!' aparezca 6 veces
    const expectedMessage = '¡Estás en la media!';
    const actualMessages = $('.highlight').map((i, elem) => $(elem).text()).get();
    const messageCount = actualMessages.filter((msg) => msg === expectedMessage).length;
    expect(messageCount).toBe(6);
  });

  it('debería responder correctamente a la ruta /resultados-mano-habil', async () => {
    const response = await testSession.get('/resultados-mano-habil');
    expect(response.status).toBe(200);
    const $ = cheerio.load(response.text);

    expect($('title').text()).toBe('Resultados por Mano Hábil');
    expect($('h2.orange-box')).toHaveLength(6);
    expect($('.ranking-number')).toHaveLength(6);
    expect($('.highlight')).toHaveLength(6);  
    
    // Verifica que los textos de reacción y coordinación estén presentes
    const texts = ['Velocidad (Derecha)', 'Velocidad (Izquierda)','Reacción (Derecha)', 'Reacción (Izquierda)', 'Coordinación (Derecha)', 'Coordinación (Izquierda)'];
    texts.forEach((text) => {
      expect($('body').text()).toContain(text);
    });

    // Verifica que los rankings sean correctos
    const expectedRanking = '1';
    $('.ranking-number').each((i, elem) => {
      expect($(elem).text()).toBe(expectedRanking);
    });

    // Verifica que el mensaje '¡Estás en la media!' aparezca 6 veces
    const expectedMessage = '¡Estás en la media!';
    const actualMessages = $('.highlight').map((i, elem) => $(elem).text()).get();
    const messageCount = actualMessages.filter((msg) => msg === expectedMessage).length;
    expect(messageCount).toBe(6);
  });

  it('debería responder correctamente a la ruta /resultados-mano-uso', async () => {
    const response = await testSession.get('/resultados-mano-uso');
    expect(response.status).toBe(200);
    const $ = cheerio.load(response.text);

    expect($('title').text()).toBe('Resultados por Mano Uso Móvil');
    expect($('h2.orange-box')).toHaveLength(6);
    expect($('.ranking-number')).toHaveLength(6);
    expect($('.highlight')).toHaveLength(6);  
    
    // Verifica que los textos de reacción y coordinación estén presentes
    const texts = ['Velocidad (Derecha)', 'Velocidad (Izquierda)','Reacción (Derecha)', 'Reacción (Izquierda)', 'Coordinación (Derecha)', 'Coordinación (Izquierda)'];
    texts.forEach((text) => {
      expect($('body').text()).toContain(text);
    });

    // Verifica que los rankings sean correctos
    const expectedRanking = '1';
    $('.ranking-number').each((i, elem) => {
      expect($(elem).text()).toBe(expectedRanking);
    });

    // Verifica que el mensaje '¡Estás en la media!' aparezca 6 veces
    const expectedMessage = '¡Estás en la media!';
    const actualMessages = $('.highlight').map((i, elem) => $(elem).text()).get();
    const messageCount = actualMessages.filter((msg) => msg === expectedMessage).length;
    expect(messageCount).toBe(6);
  });

  it('debería responder correctamente a la ruta /resultados-horas-uso', async () => {
    const response = await testSession.get('/resultados-horas-uso');
    expect(response.status).toBe(200);
    const $ = cheerio.load(response.text);

    expect($('title').text()).toBe('Resultados por Horas Uso Móvil');
    expect($('h2.orange-box')).toHaveLength(6);
    expect($('.ranking-number')).toHaveLength(6);
    expect($('.highlight')).toHaveLength(6);  
    
    // Verifica que los textos de reacción y coordinación estén presentes
    const texts = ['Velocidad (Derecha)', 'Velocidad (Izquierda)','Reacción (Derecha)', 'Reacción (Izquierda)', 'Coordinación (Derecha)', 'Coordinación (Izquierda)'];
    texts.forEach((text) => {
      expect($('body').text()).toContain(text);
    });

    // Verifica que los rankings sean correctos
    const expectedRanking = '1';
    $('.ranking-number').each((i, elem) => {
      expect($(elem).text()).toBe(expectedRanking);
    });

    // Verifica que el mensaje '¡Estás en la media!' aparezca 6 veces
    const expectedMessage = '¡Estás en la media!';
    const actualMessages = $('.highlight').map((i, elem) => $(elem).text()).get();
    const messageCount = actualMessages.filter((msg) => msg === expectedMessage).length;
    expect(messageCount).toBe(6);
  });

  it('debería responder correctamente a la ruta /resultados-finales', async () => {
    const response = await request(server).get('/resultados-finales');
    expect(response.status).toBe(200);
  });

  it('debería ordenar correctamente los usuarios por puntuación o tiempo en los juegos 1 y 3', () => {
    const users = [
      { score: NaN },
      { score: 10 },
      { score: 20 },
      { score: NaN },
      { score: 30 },
    ];
    const sortedUsers = sortByScore(users, 'score', compareNumbers1and3);
    expect(sortedUsers).toEqual([
      { score: 30 },
      { score: 20 },
      { score: 10 },
      { score: NaN },
      { score: NaN },
    ]);
  });

  it('debería ordenar correctamente los usuarios por tiempo en el juego 2', () => {
    const users = [
      { score: NaN },
      { score: 10 },
      { score: 20 },
      { score: NaN },
      { score: 30 },
    ];
    const sortedUsers = sortByScore(users, 'score', compareNumbers2);
    expect(sortedUsers).toEqual([
      { score: 10 },
      { score: 20 },
      { score: 30 },
      { score: NaN },
      { score: NaN },
    ]);    
});

describe('Pruebas para calculateAge', () => {
  it('debería devolver "Inferior a 14 años" para edades menores o iguales a 14', async () => {
    const rangoEdad = await calculateAge(14);
    expect(rangoEdad).toBe('Inferior a 14 años');
  });

  it('debería devolver "15 a 17 años" para edades entre 15 y 17', async () => {
    const rangoEdad = await calculateAge(16);
    expect(rangoEdad).toBe('15 a 17 años');
  });

  it('debería devolver "18 a 24 años" para edades entre 18 y 24', async () => {
    const rangoEdad = await calculateAge(20);
    expect(rangoEdad).toBe('18 a 24 años');
  });

  it('debería devolver "25 a 35 años" para edades entre 25 y 35', async () => {
    const rangoEdad = await calculateAge(30);
    expect(rangoEdad).toBe('25 a 35 años');
  });

  it('debería devolver "36 a 45 años" para edades entre 36 y 45', async () => {
    const rangoEdad = await calculateAge(40);
    expect(rangoEdad).toBe('36 a 45 años');
  });

  it('debería devolver "46 a 60 años" para edades entre 46 y 60', async () => {
    const rangoEdad = await calculateAge(50);
    expect(rangoEdad).toBe('46 a 60 años');
  });

  it('debería devolver "Superior a 60 años" para edades mayores a 60', async () => {
    const rangoEdad = await calculateAge(61);
    expect(rangoEdad).toBe('Superior a 60 años');
  });
});

describe('Pruebas para getHorasUsoTexto', () => {
  it('debería devolver "menos de 1 hora" para "<1"', () => {
    const texto = getHorasUsoTexto('<1');
    expect(texto).toBe('menos de 1 hora');
  });

  it('debería devolver "entre 1 y 3 horas" para "1-3"', () => {
    const texto = getHorasUsoTexto('1-3');
    expect(texto).toBe('entre 1 y 3 horas');
  });

  it('debería devolver "entre 3 y 5 horas" para "3-5"', () => {
    const texto = getHorasUsoTexto('3-5');
    expect(texto).toBe('entre 3 y 5 horas');
  });

  it('debería devolver "entre 5 y 8 horas" para "5-8"', () => {
    const texto = getHorasUsoTexto('5-8');
    expect(texto).toBe('entre 5 y 8 horas');
  });

  it('debería devolver "más de 8 horas" para ">8"', () => {
    const texto = getHorasUsoTexto('>8');
    expect(texto).toBe('más de 8 horas');
  });

  it('debería devolver "no especificado" para cualquier otro valor', () => {
    const texto = getHorasUsoTexto('otro valor');
    expect(texto).toBe('no especificado');
  });
});



});