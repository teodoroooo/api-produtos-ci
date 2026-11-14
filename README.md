# API de Produtos com CI

API REST de produtos (CRUD) feita em Node.js 22, TypeScript, Express 4 e PostgreSQL 16.
O projeto foi criado para a atividade "Implementação do CI" da disciplina Integração e
Entrega Contínua. O foco é o workflow de CI no GitHub Actions, que roda a cada Pull Request.

## Endpoints

| Método | Rota            | Descrição                    | Respostas     |
| ------ | --------------- | ---------------------------- | ------------- |
| GET    | `/health`       | Verifica se a API está no ar | 200           |
| GET    | `/produtos`     | Lista todos os produtos      | 200           |
| GET    | `/produtos/:id` | Busca um produto             | 200, 404      |
| POST   | `/produtos`     | Cria um produto              | 201, 400      |
| PUT    | `/produtos/:id` | Atualiza um produto          | 200, 400, 404 |
| DELETE | `/produtos/:id` | Remove um produto            | 204, 404      |

Exemplo de corpo para POST e PUT:

```json
{ "nome": "Teclado", "preco": 199.9, "estoque": 10 }
```

Erros inesperados devolvem `500` com a mensagem genérica `Erro interno do servidor`,
sem expor detalhes internos.

## Estrutura

```
src/
  app.ts                 # monta o Express e trata erros
  server.ts              # ponto de entrada (migração + listen)
  db.ts                  # pool do pg e CREATE TABLE
  produto.routes.ts      # camada HTTP
  produto.service.ts     # regras de negócio e validação
  produto.repository.ts  # SQL parametrizado ($1, $2...)
  produto.validation.ts  # validação dos dados de entrada
tests/
  unit/                  # sem banco (repositório mockado)
  integration/           # PostgreSQL real
```

## Como rodar localmente

Requisitos: Node.js 22+ e PostgreSQL 16 (ou Docker).

```bash
npm ci
npm run build
docker compose up --build   # sobe o PostgreSQL e a API na porta 3000
```

Sem Docker, defina `DATABASE_URL` apontando para um PostgreSQL e rode `npm start`.

## Scripts

| Script                     | O que faz                                       |
| -------------------------- | ----------------------------------------------- |
| `npm run format:check`     | Verifica a formatação com Prettier              |
| `npm run lint`             | Análise estática com ESLint + typescript-eslint |
| `npm run security:sast`    | SAST com eslint-plugin-security                 |
| `npm run security:deps`    | `npm audit` das dependências de produção        |
| `npm run build`            | Compila o TypeScript para `dist/`               |
| `npm run test:unit`        | Testes unitários (Jest)                         |
| `npm run test:integration` | Testes de integração (precisa de PostgreSQL)    |

## Workflow de CI

Arquivo: `.github/workflows/ci.yml`. Dispara em Pull Request para `main` ou `develop`.

1. Análise de formatação
2. Análise estática de código
3. Análise estática de segurança
4. Build
5. Testes unitários
6. Testes de integração (com smoke test do `dist/`)
7. Criação da imagem Docker (publicada no ghcr.io)

Os jobs são encadeados com `needs`: se um falha, os seguintes não rodam.

## Como contribuir

1. Crie uma branch a partir da `main` (ex.: `feature/minha-alteracao`).
2. Antes do commit, rode localmente `npm run format:check`, `npm run lint` e `npm run test:unit`.
3. Abra um Pull Request para `main` ou `develop`.
4. O workflow de CI roda sozinho no PR. O merge só deve ser feito com os 7 jobs aprovados.
