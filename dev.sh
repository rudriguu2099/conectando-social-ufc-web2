#!/bin/sh
set -e
cd "$(dirname "$0")"
docker compose up -d --build --renew-anon-volumes db backend
until curl -sf http://localhost:3000/api/health >/dev/null; do sleep 1; done
docker compose exec backend npm run seed:demo
cd frontend
VITE_API_URL=http://localhost:3000 npm run dev
