const request = require('supertest');
const session = require('supertest-session');
const {server, setupDatabase, client}= require('../main.js');

describe('Pruebas para el servidor', () => {
  let testSession = null;

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
      scoregame2d: 100,
    };

    const response = await testSession.post('/gamesave2-a').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
  });

  it('debería manejar correctamente el guardado del juego 2 (parte b)', async () => {
    const data = {
      scoregame2i: 100,
    };

    const response = await testSession.post('/gamesave2-b').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Puntuación del juego guardada exitosamente.' });
  });

});