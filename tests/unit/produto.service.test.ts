import { NaoEncontradoError, ValidacaoError } from '../../src/errors';
import { ProdutoService } from '../../src/produto.service';
import { Produto, ProdutoRepository } from '../../src/produto.types';

const produto: Produto = {
  id: 1,
  nome: 'Monitor',
  preco: 899.9,
  estoque: 5,
  criado_em: '2026-11-13T12:00:00.000Z',
};

function criarRepositorioMock(): jest.Mocked<ProdutoRepository> {
  return {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  };
}

describe('ProdutoService (repositório mockado)', () => {
  let repositorio: jest.Mocked<ProdutoRepository>;
  let service: ProdutoService;

  beforeEach(() => {
    repositorio = criarRepositorioMock();
    service = new ProdutoService(repositorio);
  });

  it('lista os produtos do repositório', async () => {
    repositorio.listar.mockResolvedValue([produto]);
    await expect(service.listar()).resolves.toEqual([produto]);
  });

  it('busca produto existente pelo id', async () => {
    repositorio.buscarPorId.mockResolvedValue(produto);
    await expect(service.buscarPorId(1)).resolves.toEqual(produto);
    expect(repositorio.buscarPorId).toHaveBeenCalledWith(1);
  });

  it('lança NaoEncontradoError quando o produto não existe', async () => {
    repositorio.buscarPorId.mockResolvedValue(null);
    await expect(service.buscarPorId(99)).rejects.toBeInstanceOf(NaoEncontradoError);
  });

  it('cria produto com dados validados', async () => {
    repositorio.criar.mockResolvedValue(produto);
    await service.criar({ nome: ' Monitor ', preco: 899.9, estoque: 5 });
    expect(repositorio.criar).toHaveBeenCalledWith({ nome: 'Monitor', preco: 899.9, estoque: 5 });
  });

  it('não chama o repositório quando os dados são inválidos', async () => {
    await expect(service.criar({ nome: '' })).rejects.toBeInstanceOf(ValidacaoError);
    expect(repositorio.criar).not.toHaveBeenCalled();
  });

  it('atualiza produto existente', async () => {
    repositorio.atualizar.mockResolvedValue({ ...produto, estoque: 7 });
    const atualizado = await service.atualizar(1, { nome: 'Monitor', preco: 899.9, estoque: 7 });
    expect(atualizado.estoque).toBe(7);
  });

  it('valida os dados antes de atualizar', async () => {
    await expect(service.atualizar(1, { preco: -5 })).rejects.toBeInstanceOf(ValidacaoError);
    expect(repositorio.atualizar).not.toHaveBeenCalled();
  });

  it('lança NaoEncontradoError ao atualizar produto inexistente', async () => {
    repositorio.atualizar.mockResolvedValue(null);
    await expect(service.atualizar(99, { nome: 'X', preco: 1, estoque: 1 })).rejects.toBeInstanceOf(
      NaoEncontradoError,
    );
  });

  it('remove produto existente', async () => {
    repositorio.remover.mockResolvedValue(true);
    await expect(service.remover(1)).resolves.toBeUndefined();
  });

  it('lança NaoEncontradoError ao remover produto inexistente', async () => {
    repositorio.remover.mockResolvedValue(false);
    await expect(service.remover(99)).rejects.toBeInstanceOf(NaoEncontradoError);
  });
});
