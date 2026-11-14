import express, { Express, NextFunction, Request, Response } from 'express';
import { NaoEncontradoError, ValidacaoError } from './errors';
import { criarRotasProdutos } from './produto.routes';
import { ProdutoService } from './produto.service';

function ehJsonInvalido(erro: unknown): boolean {
  return erro instanceof SyntaxError && 'status' in erro && erro.status === 400;
}

/**
 * Middleware de erro. Erros 500 não devolvem detalhes internos ao cliente.
 * O Express reconhece o middleware de erro pelos 4 parâmetros.
 */
function tratarErro(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  void _next;
  if (erro instanceof ValidacaoError) {
    res.status(400).json({ erro: erro.message, detalhes: erro.detalhes });
    return;
  }
  if (ehJsonInvalido(erro)) {
    res.status(400).json({ erro: 'JSON inválido' });
    return;
  }
  if (erro instanceof NaoEncontradoError) {
    res.status(404).json({ erro: erro.message });
    return;
  }
  console.error('Erro inesperado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

/** Monta a aplicação Express recebendo o serviço por injeção de dependência. */
export function criarApp(service: ProdutoService): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/produtos', criarRotasProdutos(service));

  app.use((_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });

  app.use(tratarErro);

  return app;
}
