import request from 'supertest';
import { criarApp } from '../../src/app';
import { ProdutoService } from '../../src/produto.service';
import { Produto, ProdutoRepository } from '../../src/produto.types';

const produto: Produto = {
  id: 1,
  nome: 'Cadeira',
  preco: 450,
  estoque: 3,
  criado_em: '2026-11-13T12:00:00.000Z',
};

describe('Rotas HTTP (repositório mockado)', () => {
  let repositorio: jest.Mocked<ProdutoRepository>;
  let app: ReturnType<typeof criarApp>;

  beforeEach(() => {
    repositorio = {
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    };
    app = criarApp(new ProdutoService(repositorio));
  });

  it('GET /health responde 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /produtos responde 200 com a lista', async () => {
    repositorio.listar.mockResolvedValue([produto]);
    const res = await request(app).get('/produtos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([produto]);
  });

  it('GET /produtos/:id responde 404 para id inexistente', async () => {
    repositorio.buscarPorId.mockResolvedValue(null);
    const res = await request(app).get('/produtos/99');
    expect(res.status).toBe(404);
  });

  it('GET /produtos/:id responde 404 para id não numérico sem consultar o banco', async () => {
    const res = await request(app).get('/produtos/abc');
    expect(res.status).toBe(404);
    expect(repositorio.buscarPorId).not.toHaveBeenCalled();
  });

  it('POST /produtos responde 201 com o produto criado', async () => {
    repositorio.criar.mockResolvedValue(produto);
    const res = await request(app)
      .post('/produtos')
      .send({ nome: 'Cadeira', preco: 450, estoque: 3 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });

  it('POST /produtos responde 400 com dados inválidos', async () => {
    const res = await request(app).post('/produtos').send({ nome: '', preco: -1 });
    expect(res.status).toBe(400);
    expect(res.body.detalhes.length).toBeGreaterThan(0);
  });

  it('POST /produtos responde 400 para JSON malformado', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Content-Type', 'application/json')
      .send('{"nome": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: 'JSON inválido' });
  });

  it('PUT /produtos/:id responde 200 com o produto atualizado', async () => {
    repositorio.atualizar.mockResolvedValue({ ...produto, preco: 399.9 });
    const res = await request(app)
      .put('/produtos/1')
      .send({ nome: 'Cadeira', preco: 399.9, estoque: 3 });
    expect(res.status).toBe(200);
    expect(res.body.preco).toBe(399.9);
  });

  it('DELETE /produtos/:id responde 204', async () => {
    repositorio.remover.mockResolvedValue(true);
    const res = await request(app).delete('/produtos/1');
    expect(res.status).toBe(204);
  });

  it('responde 500 sem vazar detalhes internos', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    repositorio.listar.mockRejectedValue(new Error('senha do banco: segredo123'));
    const res = await request(app).get('/produtos');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
    expect(JSON.stringify(res.body)).not.toContain('segredo123');
  });

  it('rota desconhecida responde 404', async () => {
    const res = await request(app).get('/nao-existe');
    expect(res.status).toBe(404);
  });
});
