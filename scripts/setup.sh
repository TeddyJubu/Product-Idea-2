#!/usr/bin/env bash
set -euo pipefail
echo "→ Installing deps"
npm i
echo "→ Starting local Postgres (docker-compose)"
docker compose up -d db
echo "→ Generating Prisma client"
npx prisma generate
echo "→ Running first migration"
npx prisma migrate dev --name init
echo "→ Seeding database"
npm run db:seed
echo "→ Installing shadcn components"
bash scripts/shadcn-install.sh
echo "✅ Setup complete. Next: cp .env.example .env && npm run dev"
