# PostgreSQL → MySQL Migration Status

## Summary: Migration is application-complete

All **application logic** that previously depended on PostgreSQL has been moved to **MySQL-compatible code**. No database-side triggers or stored procedures are required on MySQL.

---

## What was migrated

### 1. Schema (Prisma)

- **Provider**: `postgresql` → `mysql` in `prisma/schema.prisma`.
- **books.id**: Uses `@default(uuid())` (no PostgreSQL `gen_random_uuid()`).
- **Array columns** (`bisac_codes`, `meta_keywords`, `related_tags_keywords`, `search_keywords`): Stored as `Json` in MySQL (no native array type).
- **Tables**: `books`, `admin_users`, `bestseller_books`, `daily_deals` — same structure, MySQL-compatible types.

### 2. Former PostgreSQL functions → TypeScript (no DB functions on MySQL)

| Former PostgreSQL function      | Now implemented in                         |
|--------------------------------|--------------------------------------------|
| `search_books(...)`            | `db.books.search()` in `src/lib/database.ts` |
| `filter_books(...)`           | `db.books.filter()`                         |
| `get_similar_books` / `_v2`    | `db.books.getSimilar()`                     |
| `get_category_counts()`        | `db.categories.getGenreCounts()` (Prisma `groupBy`) |
| `get_author_counts()`          | `db.categories.getAuthorCounts()` (Prisma `groupBy`) |
| `get_publisher_counts()`       | `db.categories.getPublisherCounts()` (Prisma `groupBy`) |
| `get_bestseller_books_v2(...)` | `db.bestsellers.getAll()` (Prisma + relation) |
| `add_bestseller_by_asin(...)`  | `db.bestsellers.addByASIN()` (Prisma create) |
| `remove_bestseller_by_asin(...)` | `db.bestsellers.removeByASIN()` (Prisma updateMany) |
| `get_all_daily_deals()`       | `db.deals.getAll()` (Prisma + join by asin) |
| `get_daily_deals_for_book(...)`| `db.deals.getForBook()`                     |
| Deal stats (COUNT FILTER)      | `db.deals.getStats()` (multiple Prisma counts) |

**Triggers**: The previous PostgreSQL setup did not rely on triggers for core app behavior; the app used functions and application logic. No triggers were migrated because none are required for the current app behavior on MySQL.

### 3. Raw SQL removed

- All `prisma.$queryRaw` calls that invoked PostgreSQL functions have been replaced by Prisma queries in `src/lib/database.ts`.
- The **similar-books API** uses `db.books.getSimilar()` instead of raw SQL.
- **Case sensitivity**: `mode: 'insensitive'` (PostgreSQL-only) removed; MySQL’s default collation is used.

### 4. Environment and deployment

- **.env / .env.local**: Use a MySQL URL, e.g. `mysql://user:password@host:3306/database`.
- **.env.example**: Added with a MySQL `DATABASE_URL` template.
- **MYMILESWEB_DEPLOYMENT.md**: Steps to run the app on MyMilesWeb with MySQL and Node.js.

---

## What you must do to run the app

1. **Install and run MySQL** (locally or on your host).
2. **Create database and user** (e.g. in cPanel or MySQL CLI).
3. **Set `DATABASE_URL`** in `.env` to your MySQL URL (see `.env.example`).
4. **Generate Prisma Client and push schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Start the app**:
   ```bash
   npm run dev
   ```

If **PrismaClientInitializationError** or “Invalid invocation” appears, Prisma cannot connect to the database. Check:

- MySQL is running.
- `DATABASE_URL` is correct (host, port 3306, user, password, database name).
- You ran `npx prisma generate` after cloning or changing the schema.
- Firewall/network allows connections to the MySQL port.

---

## Obsolete files (PostgreSQL-only; not used by the app)

These scripts were for the old PostgreSQL setup and are **not** used by the Next.js app on MySQL. You can ignore or remove them:

- `check-db-user.js` – PostgreSQL user/function checks
- `apply-function-fix.js` – PostgreSQL function fix
- `test-existing-function.js` – PostgreSQL function test
- `setup-database-functions.sql` – Defines PostgreSQL functions (replaced by app code)
- `fix_bestseller_function.sql` – PostgreSQL bestseller function
- `local_schema.sql` – PostgreSQL schema/functions dump

The app does **not** call any of these; all logic is in `src/lib/database.ts` and works with MySQL only.

---

## Data migration (if you had data in PostgreSQL)

To move **data** from an existing PostgreSQL database to MySQL:

1. Export data from PostgreSQL (e.g. CSV or table dumps).
2. Create MySQL tables with `npx prisma db push` (or run migrations).
3. Import data into MySQL (e.g. via scripts or MySQL `LOAD DATA` / import tools), mapping types (e.g. arrays → JSON) as needed.

Schema and application migration are complete; data migration is separate and depends on your export/import approach.
