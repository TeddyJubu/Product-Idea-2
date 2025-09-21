# Idea ICE – Idea Management & Validation (ICE)

Minimal, fast, UX-first system to **capture → prioritize (ICE) → validate → decide**.

## Stack
Next.js 14 • TypeScript • Tailwind + shadcn/ui • Prisma • PostgreSQL • NextAuth

## Dev Setup
```bash
cp .env.example .env
docker compose up -d db
npm i
npm run db:migrate
npm run db:seed
bash scripts/shadcn-install.sh
npm run dev
```
Open http://localhost:3000

## Scripts
- `npm run db:migrate` – run first migration
- `npm run db:seed` – seed demo workspace + ideas
- `bash scripts/setup.sh` – one-shot local setup

## License
MIT
