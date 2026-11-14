import { NextFunction, Request, Response, Router } from 'express';
import { NaoEncontradoError } from './errors';
import { ProdutoService } from './produto.service';
import { converterId } from './produto.validation';

type Handler = (req: Request, res: Response) => Promise<void>;

/** Encaminha erros de handlers assíncronos para o middleware de erro (Express 4). */
function assincrono(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res).catch(next);
  };
}

function idDaRota(req: Request): number {
  const id = converterId(req.params.id);
  if (id === null) {
    throw new NaoEncontradoError();
  }
  return id;
}

/** Rotas REST de /produtos. */
export function criarRotasProdutos(service: ProdutoService): Router {
  const router = Router();

  router.get(
    '/',
    assincrono(async (_req, res) => {
      res.status(200).json(await service.listar());
    }),
  );

  router.get(
    '/:id',
    assincrono(async (req, res) => {
      res.status(200).json(await service.buscarPorId(idDaRota(req)));
    }),
  );

  router.post(
    '/',
    assincrono(async (req, res) => {
      res.status(201).json(await service.criar(req.body));
    }),
  );

  router.put(
    '/:id',
    assincrono(async (req, res) => {
      res.status(200).json(await service.atualizar(idDaRota(req), req.body));
    }),
  );

  router.delete(
    '/:id',
    assincrono(async (req, res) => {
      await service.remover(idDaRota(req));
      res.status(204).send();
    }),
  );

  return router;
}
