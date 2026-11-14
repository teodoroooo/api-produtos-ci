import { ProdutoEntrada } from './produto.types';

export const NOME_MAX = 120;
export const PRECO_MAX = 99999999.99;
export const INTEIRO_MAX = 2147483647;

export type ResultadoValidacao =
  { valido: true; dados: ProdutoEntrada } | { valido: false; erros: string[] };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function validarNome(nome: unknown, erros: string[]): void {
  if (typeof nome !== 'string' || nome.trim().length === 0) {
    erros.push('nome é obrigatório');
  } else if (nome.trim().length > NOME_MAX) {
    erros.push(`nome deve ter no máximo ${NOME_MAX} caracteres`);
  }
}

function validarPreco(preco: unknown, erros: string[]): void {
  if (typeof preco !== 'number' || !Number.isFinite(preco)) {
    erros.push('preco deve ser um número');
  } else if (preco < 0 || preco > PRECO_MAX) {
    erros.push(`preco deve estar entre 0 e ${PRECO_MAX}`);
  } else if (Math.round(preco * 100) / 100 !== preco) {
    erros.push('preco deve ter no máximo 2 casas decimais');
  }
}

function validarEstoque(estoque: unknown, erros: string[]): void {
  if (typeof estoque !== 'number' || !Number.isInteger(estoque)) {
    erros.push('estoque deve ser um número inteiro');
  } else if (estoque < 0 || estoque > INTEIRO_MAX) {
    erros.push(`estoque deve estar entre 0 e ${INTEIRO_MAX}`);
  }
}

/** Valida o corpo de criação/atualização de um produto. */
export function validarProduto(corpo: unknown): ResultadoValidacao {
  if (!ehObjeto(corpo)) {
    return { valido: false, erros: ['O corpo da requisição deve ser um objeto JSON'] };
  }

  const erros: string[] = [];
  validarNome(corpo.nome, erros);
  validarPreco(corpo.preco, erros);
  validarEstoque(corpo.estoque, erros);

  if (erros.length > 0) {
    return { valido: false, erros };
  }

  return {
    valido: true,
    dados: {
      nome: String(corpo.nome).trim(),
      preco: Number(corpo.preco),
      estoque: Number(corpo.estoque),
    },
  };
}

/** Converte o parâmetro :id da rota em inteiro positivo, ou null se inválido. */
export function converterId(valor: string): number | null {
  if (!/^\d{1,10}$/.test(valor)) {
    return null;
  }
  const id = Number(valor);
  return id >= 1 && id <= INTEIRO_MAX ? id : null;
}
