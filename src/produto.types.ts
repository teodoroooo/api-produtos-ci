/** Produto como é armazenado e devolvido pela API. */
export interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  criado_em: string;
}

/** Dados de entrada para criar ou atualizar um produto. */
export interface ProdutoEntrada {
  nome: string;
  preco: number;
  estoque: number;
}

/** Contrato do repositório (camada de acesso a dados). */
export interface ProdutoRepository {
  listar(): Promise<Produto[]>;
  buscarPorId(id: number): Promise<Produto | null>;
  criar(dados: ProdutoEntrada): Promise<Produto>;
  atualizar(id: number, dados: ProdutoEntrada): Promise<Produto | null>;
  remover(id: number): Promise<boolean>;
}
