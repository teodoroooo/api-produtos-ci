import { NaoEncontradoError, ValidacaoError } from './errors';
import { Produto, ProdutoRepository } from './produto.types';
import { validarProduto } from './produto.validation';

/** Regras de negócio de produtos. Não conhece HTTP nem SQL. */
export class ProdutoService {
  constructor(private readonly repositorio: ProdutoRepository) {}

  listar(): Promise<Produto[]> {
    return this.repositorio.listar();
  }

  async buscarPorId(id: number): Promise<Produto> {
    const produto = await this.repositorio.buscarPorId(id);
    if (!produto) {
      throw new NaoEncontradoError();
    }
    return produto;
  }

  async criar(corpo: unknown): Promise<Produto> {
    const resultado = validarProduto(corpo);
    if (!resultado.valido) {
      throw new ValidacaoError(resultado.erros);
    }
    return this.repositorio.criar(resultado.dados);
  }

  async atualizar(id: number, corpo: unknown): Promise<Produto> {
    const resultado = validarProduto(corpo);
    if (!resultado.valido) {
      throw new ValidacaoError(resultado.erros);
    }
    const produto = await this.repositorio.atualizar(id, resultado.dados);
    if (!produto) {
      throw new NaoEncontradoError();
    }
    return produto;
  }

  async remover(id: number): Promise<void> {
    const removido = await this.repositorio.remover(id);
    if (!removido) {
      throw new NaoEncontradoError();
    }
  }
}
