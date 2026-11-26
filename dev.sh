#!/bin/sh
set -e
cd "$(dirname "$0")"
docker compose up -d --build db backend
cd frontend
API_URL=http://localhost:3000 npm run dev
