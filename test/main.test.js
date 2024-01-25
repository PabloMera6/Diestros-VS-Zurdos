const request = require('supertest');
const session = require('supertest-session');
const {server, setupDatabase, client, calculateResultsGame1, calculateResultsGame2, calculateResultsGame3}= require('../main.js');
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
  });

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
  });

  it('debería responder correctamente 0/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await request(server).get('/menu');
    expect(response.status).toBe(200);
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: false, juego2_done: false, juego3_done: false, mostrar_resultados: false }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-1', async () => {
    const response = await request(server).get('/introduccion-1');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game1', async () => {
    const response = await request(server).get('/game1');
    expect(response.status).toBe(200);
  });

  it('debería manejar correctamente el guardado del juego 1 (parte a)', async () => {
    const data = {
      scoregame1d: 100,
    };
    const response = await testSession.post('/gamesave1-a').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
  });

  it('debería manejar correctamente el guardado del juego 1 (parte b)', async () => {
    const data = {
      scoregame1i: 100,
    };
    const response = await testSession.post('/gamesave1-b').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
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

  it('debería responder correctamente 1/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await request(server).get('/menu');
    expect(response.status).toBe(200);
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: false, juego3_done: false, mostrar_resultados: false }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-2', async () => {
    const response = await request(server).get('/introduccion-2');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game2', async () => {
    const response = await request(server).get('/game2');
    expect(response.status).toBe(200);
  });

  it('debería manejar correctamente el guardado del juego 2 (parte a)', async () => {
    const data = {
      scoregame2d: 250.90,
    };

    const response = await testSession.post('/gamesave2-a').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
  });

  it('debería manejar correctamente el guardado del juego 2 (parte b)', async () => {
    const data = {
      scoregame2i: 250.90,
    };

    const response = await testSession.post('/gamesave2-b').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
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

  it('debería responder correctamente 2/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await request(server).get('/menu');
    expect(response.status).toBe(200);
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: true, juego3_done: false, mostrar_resultados: false }));
    renderSpy.mockRestore();
  });

  it('debería responder correctamente a la ruta /introduccion-3', async () => {
    const response = await request(server).get('/introduccion-3');
    expect(response.status).toBe(200);
  });

  it('debería responder correctamente a la ruta /game3', async () => {
    const response = await request(server).get('/game3');
    expect(response.status).toBe(200);
  });

  it('debería manejar correctamente el guardado del juego 3 (parte a)', async () => {
    const data = {
      scoregame3d: 10204.10,
    };

    const response = await testSession.post('/gamesave3-a').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
  });

  it('debería manejar correctamente el guardado del juego 3 (parte b)', async () => {
    const data = {
      scoregame3i: 10204.10,
    };

    const response = await testSession.post('/gamesave3-b').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
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

  it('debería responder correctamente 3/3 en la ruta /menu', async () => {
    const renderSpy = jest.spyOn(server.response, 'render');
    const response = await request(server).get('/menu');
    expect(response.status).toBe(200);
    expect(renderSpy).toHaveBeenCalledWith('menu', expect.objectContaining({ juego1_done: true, juego2_done: true, juego3_done: true, mostrar_resultados: true }));
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
});