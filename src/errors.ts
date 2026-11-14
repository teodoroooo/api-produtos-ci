/** Erro de validação dos dados enviados pelo cliente (HTTP 400). */
export class ValidacaoError extends Error {
  constructor(public readonly detalhes: string[]) {
    super('Dados inválidos');
    this.name = 'ValidacaoError';
  }
}

/** Recurso não encontrado (HTTP 404). */
export class NaoEncontradoError extends Error {
  constructor(mensagem = 'Produto não encontrado') {
    super(mensagem);
    this.name = 'NaoEncontradoError';
  }
}
