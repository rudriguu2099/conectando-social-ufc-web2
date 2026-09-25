# conectando-social-ufc-web2-

## Pra rodar:

```sh
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