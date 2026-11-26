# conectando-social-ufc-web2-

## Pra rodar:

```sh
cp backend/.env.example backend/.env   # só na primeira vez; troque o JWT_SECRET
docker compose up --build
```

Ou, com o front rodando fora do Docker: `./dev.sh`

- Frontend (React + Vite): http://localhost:5173
- Backend (Express + Prisma): http://localhost:3000/api/health
- Swagger (fora de produção): http://localhost:3000/api/docs
- Postgres: localhost:5432 (app/app)

Nova migration depois de alterar `backend/prisma/schema.prisma`:

```sh
docker compose exec backend npx prisma migrate dev --name <nome>
```
Depois de mudar dependências (`package.json`), suba com `-V` pra recriar o `node_modules` do container:

```sh
docker compose up --build -V
```

## Contas e testes

Professores não se cadastram; a conta vem do seed:

```sh
docker compose exec backend npm run seed                                # Prof. Carla Mendes (carla@ufc.br / senha1234), só dev
docker compose exec backend npm run seed -- "Nome" email@ufc.br senha   # professor real
docker compose exec backend npm run seed:demo                           # parceiros, alunos e projetos de exemplo, só dev (senha de todos: senha1234)
docker compose exec backend npm test
```

Contas do `seed:demo`: `maria@vidanova.org` (parceiro), `ana.ribeiro@alu.ufc.br` (aluno) e `carla@ufc.br` (professor). A senha só é definida quando a conta é criada; contas que já existem não mudam.

## Deploy

- Lembrar de configurar o `trust proxy` no deploy (`backend/src/index.ts`): `app.set('trust proxy', 1)` se tiver um proxy reverso na frente. Sem isso o limite de login vê o IP do proxy em vez do usuário. Nunca usar `true`.

## Lint e formatação (Biome)

Rode uma vez na raiz do repositório para instalar o Biome e o hook de pre-commit:

```sh
npm install
```

A partir daí todo commit passa pelo Biome nos arquivos staged: formatação e imports são corrigidos automaticamente e erros de lint bloqueiam o commit.

- `npm run check`: verifica tudo (lint + formatação + imports)
- `npm run check:fix`: verifica e corrige o que for possível
- `npm run lint` / `npm run format`: só lint / só formatação
