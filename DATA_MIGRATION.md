# Migrate data from PostgreSQL to MySQL

Use this when you have existing data in PostgreSQL and want to move it to your new MySQL database.

## Step 1: Prepare MySQL

1. Create your MySQL database and user (e.g. in cPanel or MySQL CLI).
2. In `.env`, set **only** `DATABASE_URL` to your MySQL URL:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/bookverse_db"
   ```
3. Push the schema and create tables:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Tables should be empty (or you can run on a fresh DB).

## Step 2: Add your PostgreSQL URL

In the same `.env` file, add your **existing** PostgreSQL connection string:

```env
POSTGRES_URL="postgresql://user:password@localhost:5432/bookverse_db"
```

Use the same database where your current data lives (same host/user/password you used before).

## Step 3: Install dependency and run migration

```bash
npm install
npm run migrate:postgres-to-mysql
```

The script will:

- Read **books** from PostgreSQL (in batches of 500), convert array columns to JSON, and insert into MySQL.
- Copy **admin_users**, **bestseller_books**, and **daily_deals** in dependency order.
- Skip duplicate rows (by primary key) if you run it more than once.

## Step 4: Remove POSTGRES_URL (optional)

After migration, you can remove `POSTGRES_URL` from `.env` if you no longer need it. The app uses only `DATABASE_URL` (MySQL).

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `POSTGRES_URL` missing | Add it to `.env` as in Step 2. |
| `Cannot find module 'pg'` | Run `npm install` (adds `pg` as devDependency). |
| Duplicate key / P2002 | Normal for re-runs; those rows are skipped. |
| Foreign key error (bestseller_books) | Ensure all books are migrated first. Run migration again so books exist before bestsellers. |
| Connection refused (Postgres) | Ensure PostgreSQL is running and `POSTGRES_URL` host/port/user/password are correct. |

## One-time operation

This migration is intended as a **one-time** move from Postgres to MySQL. After that, run the app only against MySQL (`DATABASE_URL`).
