#!/bin/sh
set -e
cd "$(dirname "$0")"
docker compose up -d --build db backend
docker compose exec backend npm run seed:demo
cd frontend
VITE_API_URL=http://localhost:3000 npm run dev
