// Análise estática de segurança (SAST): eslint-plugin-security com TODAS as regras como "error".
import security from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

const todasAsRegras = Object.fromEntries(
  Object.keys(security.rules).map((regra) => [`security/${regra}`, 'error']),
);

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { security },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: todasAsRegras,
  },
];
