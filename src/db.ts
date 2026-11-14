import { Pool } from 'pg';

/** Migração executada na inicialização da aplicação. */
export const SQL_CRIAR_TABELA = `
CREATE TABLE IF NOT EXISTS produtos (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(120)   NOT NULL,
  preco     NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  estoque   INTEGER        NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);`;

/** URL de conexão (variável DATABASE_URL, com padrão para ambiente local). */
export function urlDoBanco(): string {
  return process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/produtos';
}

/** Cria o pool de conexões com o PostgreSQL. */
export function criarPool(url: string = urlDoBanco()): Pool {
  return new Pool({ connectionString: url, max: 10 });
}

/** Cria a tabela de produtos, se ainda não existir. */
export async function migrar(pool: Pool): Promise<void> {
  await pool.query(SQL_CRIAR_TABELA);
}
