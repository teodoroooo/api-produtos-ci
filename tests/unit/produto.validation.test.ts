import { converterId, NOME_MAX, validarProduto } from '../../src/produto.validation';

describe('validarProduto', () => {
  const valido = { nome: 'Teclado', preco: 199.9, estoque: 10 };

  it('aceita um produto válido', () => {
    expect(validarProduto(valido)).toEqual({ valido: true, dados: valido });
  });

  it('remove espaços extras do nome', () => {
    const resultado = validarProduto({ ...valido, nome: '  Mouse  ' });
    expect(resultado.valido && resultado.dados.nome).toBe('Mouse');
  });

  it('aceita preço e estoque iguais a zero', () => {
    expect(validarProduto({ nome: 'Brinde', preco: 0, estoque: 0 }).valido).toBe(true);
  });

  it('rejeita corpo que não é objeto', () => {
    expect(validarProduto(null)).toEqual({
      valido: false,
      erros: ['O corpo da requisição deve ser um objeto JSON'],
    });
    expect(validarProduto([valido]).valido).toBe(false);
  });

  it('rejeita nome ausente ou vazio', () => {
    expect(validarProduto({ ...valido, nome: '   ' })).toEqual({
      valido: false,
      erros: ['nome é obrigatório'],
    });
  });

  it(`rejeita nome com mais de ${NOME_MAX} caracteres`, () => {
    const resultado = validarProduto({ ...valido, nome: 'x'.repeat(NOME_MAX + 1) });
    expect(resultado.valido).toBe(false);
  });

  it('rejeita preço negativo', () => {
    expect(validarProduto({ ...valido, preco: -1 }).valido).toBe(false);
  });

  it('rejeita preço em texto', () => {
    expect(validarProduto({ ...valido, preco: '10' })).toEqual({
      valido: false,
      erros: ['preco deve ser um número'],
    });
  });

  it('rejeita preço com mais de 2 casas decimais', () => {
    expect(validarProduto({ ...valido, preco: 1.999 }).valido).toBe(false);
  });

  it('rejeita estoque fracionado ou negativo', () => {
    expect(validarProduto({ ...valido, estoque: 1.5 }).valido).toBe(false);
    expect(validarProduto({ ...valido, estoque: -3 }).valido).toBe(false);
  });

  it('acumula todos os erros encontrados', () => {
    const resultado = validarProduto({});
    expect(resultado.valido).toBe(false);
    expect(!resultado.valido && resultado.erros).toHaveLength(3);
  });
});

describe('converterId', () => {
  it('converte texto numérico positivo', () => {
    expect(converterId('42')).toBe(42);
  });

  it('rejeita zero, negativos, letras e números grandes demais', () => {
    expect(converterId('0')).toBeNull();
    expect(converterId('-1')).toBeNull();
    expect(converterId('abc')).toBeNull();
    expect(converterId('1 OR 1=1')).toBeNull();
    expect(converterId('99999999999')).toBeNull();
  });
});
