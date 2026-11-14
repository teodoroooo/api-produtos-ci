import { Pool } from 'pg';
import { Produto, ProdutoEntrada, ProdutoRepository } from './produto.types';

interface LinhaProduto {
  id: number;
  nome: string;
  preco: string;
  estoque: number;
  criado_em: Date;
}

const SQL_LISTAR = 'SELECT id, nome, preco, estoque, criado_em FROM produtos ORDER BY id';
const SQL_BUSCAR = 'SELECT id, nome, preco, estoque, criado_em FROM produtos WHERE id = $1';
const SQL_CRIAR =
  'INSERT INTO produtos (nome, preco, estoque) VALUES ($1, $2, $3) ' +
  'RETURNING id, nome, preco, estoque, criado_em';
const SQL_ATUALIZAR =
  'UPDATE produtos SET nome = $1, preco = $2, estoque = $3 WHERE id = $4 ' +
  'RETURNING id, nome, preco, estoque, criado_em';
const SQL_REMOVER = 'DELETE FROM produtos WHERE id = $1';

function paraProduto(linha: LinhaProduto): Produto {
  return {
    id: linha.id,
    nome: linha.nome,
    preco: Number(linha.preco),
    estoque: linha.estoque,
    criado_em: linha.criado_em.toISOString(),
  };
}

/** Repositório PostgreSQL. Todas as consultas são parametrizadas ($1, $2...). */
export class PgProdutoRepository implements ProdutoRepository {
  constructor(private readonly pool: Pool) {}

  async listar(): Promise<Produto[]> {
    const { rows } = await this.pool.query<LinhaProduto>(SQL_LISTAR);
    return rows.map(paraProduto);
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    const { rows } = await this.pool.query<LinhaProduto>(SQL_BUSCAR, [id]);
    const [linha] = rows;
    return linha ? paraProduto(linha) : null;
  }

  async criar(dados: ProdutoEntrada): Promise<Produto> {
    const { rows } = await this.pool.query<LinhaProduto>(SQL_CRIAR, [
      dados.nome,
      dados.preco,
      dados.estoque,
    ]);
    const [linha] = rows;
    return paraProduto(linha);
  }

  async atualizar(id: number, dados: ProdutoEntrada): Promise<Produto | null> {
    const { rows } = await this.pool.query<LinhaProduto>(SQL_ATUALIZAR, [
      dados.nome,
      dados.preco,
      dados.estoque,
      id,
    ]);
    const [linha] = rows;
    return linha ? paraProduto(linha) : null;
  }

  async remover(id: number): Promise<boolean> {
    const resultado = await this.pool.query(SQL_REMOVER, [id]);
    return (resultado.rowCount ?? 0) > 0;
  }
}
