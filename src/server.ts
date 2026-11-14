import { criarApp } from './app';
import { criarPool, migrar } from './db';
import { PgProdutoRepository } from './produto.repository';
import { ProdutoService } from './produto.service';

async function iniciar(): Promise<void> {
  const pool = criarPool();
  await migrar(pool);

  const app = criarApp(new ProdutoService(new PgProdutoRepository(pool)));
  const porta = Number(process.env.PORT ?? 3000);
  const servidor = app.listen(porta, () => {
    console.log(`API de produtos ouvindo na porta ${porta}`);
  });

  const encerrar = (): void => {
    servidor.close(() => {
      void pool.end().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', encerrar);
  process.on('SIGINT', encerrar);
}

iniciar().catch((erro: unknown) => {
  console.error('Falha ao iniciar a aplicação:', erro);
  process.exit(1);
});
