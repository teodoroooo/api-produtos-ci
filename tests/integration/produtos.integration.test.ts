import { Pool } from 'pg';
import request from 'supertest';
import { criarApp } from '../../src/app';
import { criarPool, migrar } from '../../src/db';
import { PgProdutoRepository } from '../../src/produto.repository';
import { ProdutoService } from '../../src/produto.service';

describe('API de produtos com PostgreSQL real', () => {
  let pool: Pool;
  let app: ReturnType<typeof criarApp>;

  beforeAll(async () => {
    pool = criarPool();
    await migrar(pool);
    app = criarApp(new ProdutoService(new PgProdutoRepository(pool)));
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE produtos RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('cria um produto e grava no banco (POST 201)', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({ nome: 'Notebook', preco: 3500.5, estoque: 4 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, nome: 'Notebook', preco: 3500.5, estoque: 4 });

    const { rows } = await pool.query('SELECT nome, preco FROM produtos WHERE id = $1', [1]);
    expect(rows[0]).toEqual({ nome: 'Notebook', preco: '3500.50' });
  });

  it('lista e busca produtos pelo id (GET 200)', async () => {
    await request(app).post('/produtos').send({ nome: 'Mouse', preco: 80, estoque: 20 });
    await request(app).post('/produtos').send({ nome: 'Teclado', preco: 150, estoque: 8 });

    const lista = await request(app).get('/produtos');
    expect(lista.status).toBe(200);
    expect(lista.body.map((p: { nome: string }) => p.nome)).toEqual(['Mouse', 'Teclado']);

    const unico = await request(app).get('/produtos/2');
    expect(unico.status).toBe(200);
    expect(unico.body.nome).toBe('Teclado');
  });

  it('atualiza um produto (PUT 200)', async () => {
    await request(app).post('/produtos').send({ nome: 'Monitor', preco: 900, estoque: 2 });

    const res = await request(app)
      .put('/produtos/1')
      .send({ nome: 'Monitor 27"', preco: 1199.99, estoque: 6 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ nome: 'Monitor 27"', preco: 1199.99, estoque: 6 });
  });

  it('remove um produto (DELETE 204) e depois responde 404', async () => {
    await request(app).post('/produtos').send({ nome: 'Webcam', preco: 250, estoque: 1 });

    expect((await request(app).delete('/produtos/1')).status).toBe(204);
    expect((await request(app).get('/produtos/1')).status).toBe(404);
  });

  it('responde 404 para produto inexistente em GET, PUT e DELETE', async () => {
    const corpo = { nome: 'X', preco: 1, estoque: 1 };
    expect((await request(app).get('/produtos/999')).status).toBe(404);
    expect((await request(app).put('/produtos/999').send(corpo)).status).toBe(404);
    expect((await request(app).delete('/produtos/999')).status).toBe(404);
  });

  it('trata tentativa de SQL Injection como texto comum', async () => {
    const malicioso = "Livro'); DROP TABLE produtos; --";

    const res = await request(app)
      .post('/produtos')
      .send({ nome: malicioso, preco: 10, estoque: 1 });

    expect(res.status).toBe(201);
    expect(res.body.nome).toBe(malicioso);

    const tabela = await pool.query("SELECT to_regclass('public.produtos') AS existe");
    expect(tabela.rows[0].existe).toBe('produtos');
    expect((await request(app).get('/produtos')).body).toHaveLength(1);
  });

  it('rejeita dados inválidos sem gravar nada (POST 400)', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({ nome: 'Caneta', preco: -2, estoque: 1 });
    expect(res.status).toBe(400);

    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM produtos');
    expect(rows[0].total).toBe(0);
  });
});
