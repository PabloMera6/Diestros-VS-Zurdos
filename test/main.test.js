const request = require('supertest');
const session = require('supertest-session');
const {server, setupDatabase, client, calculateResultsGame1, calculateResultsGame2, calculateResultsGame3}= require('../main.js');
const { ObjectId } = require("mongodb");


describe('Pruebas para el servidor', () => {
  let testSession = null;
  let savedUserId;

  beforeAll(async () => {
    testSession = session(server);
    await setupDatabase('UsuarioTest');
  });

  afterAll(async () => {
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

  it('debería manejar errores en el formulario', async () => {
    const data = {
      nombre: 'Te',
      edad: 2,
      manoHabil: 'derecha',
      manoUso: 'derecha',
      horasUsoMovil: '1-3',
    };

    const response = await request(server).post('/form').send(data);
    expect(response.status).toBe(400);
  });

  it('debería responder correctamente a la ruta /menu', async () => {
    const response = await request(server).get('/menu');
    expect(response.status).toBe(200);
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

});