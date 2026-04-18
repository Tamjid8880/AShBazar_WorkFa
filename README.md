# Flutter + Express to Next.js + Prisma

This folder is the migration starter for your ecommerce stack.

- Frontend (client): `app/shop`
- Frontend (admin dashboard): `app/admin`
- Backend API: `app/api/*`
- Database layer: `prisma/schema.prisma` (PostgreSQL + Prisma)

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Create migration: `npm run prisma:migrate -- --name init`
5. Start app: `npm run dev`

After pulling updates that change `prisma/schema.prisma` (new order statuses, `stockDeducted`, etc.), run:

- `npx prisma migrate dev --name order_flow` (or `prisma db push` in development)

**Order flow:** statuses include `pending`, `accepted`, `packed`, `on_the_way`, `processing`, `shipped`, `delivered`, `cancelled`. When an order moves **to** `delivered`, product quantities are reduced once (`stockDeducted` prevents double subtraction).

## Mongo to Postgres migration (priority step)

1. Ensure `.env` has:
   - `DATABASE_URL`
   - `MONGO_URL`
   - optional `MONGO_DB_NAME` (default: `test`)
   - optional `MIGRATION_TRUNCATE=true` to clear Postgres tables before import
2. Apply Prisma schema first:
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
3. Run importer:
   - `npm run migrate:data`

The importer maps Mongo `_id` to Postgres `id` so relationships remain consistent.
It also hashes legacy plain-text user passwords during import.

## Auth + upload hardening added

- Passwords now use bcrypt hashes in register/login
- Login now returns JWT token (`JWT_SECRET` required in `.env`)
- Upload endpoint added: `POST /api/upload/{category|products|posters}` with `multipart/form-data` key `file`

## Endpoint mapping

- Old `/categories` => New `/api/categories`
- Old `/products` => New `/api/products`
- Old `/orders` => New `/api/orders`
- Old `/users/login` => New `/api/users/login`

## Important note

Passwords are still plain text for compatibility with your current backend behavior.
For production, add hashed passwords and proper auth (JWT/session + roles).
