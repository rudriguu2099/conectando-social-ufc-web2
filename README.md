# conectando-social-ufc-web2-

## Pra rodar:

```sh
cp backend/.env.example backend/.env   # só na primeira vez; troque o JWT_SECRET
docker compose up --build
```

Ou, com o front rodando fora do Docker: `./dev.sh`

- Frontend (React + Vite): http://localhost:5173
- Backend (Express + Prisma): http://localhost:3000/api/health
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
docker compose exec backend npm test
```

## Deploy

- Lembrar de configurar o `trust proxy` no deploy (`backend/src/index.ts`): `app.set('trust proxy', 1)` se tiver um proxy reverso na frente. Sem isso o limite de login vê o IP do proxy em vez do usuário. Nunca usar `true`.
