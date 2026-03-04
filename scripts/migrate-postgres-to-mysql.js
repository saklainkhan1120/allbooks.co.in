/**
 * Migrate data from PostgreSQL to MySQL (Bookverse).
 *
 * Prerequisites:
 *   1. MySQL is set up and empty (run: npx prisma db push)
 *   2. Set POSTGRES_URL in .env (your existing PostgreSQL connection string)
 *   3. DATABASE_URL in .env must point to MySQL (Prisma will write here)
 *
 * Run: node scripts/migrate-postgres-to-mysql.js
 *
 * Array columns (bisac_codes, meta_keywords, related_tags_keywords, search_keywords)
 * are converted from PostgreSQL arrays to JSON for MySQL.
 */

const { PrismaClient } = require('@prisma/client');
const { Client: PgClient } = require('pg');
const BATCH_SIZE = 500;

function toJson(val) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [val];
    }
  }
  return null;
}

function rowToBook(row) {
  const r = { ...row };
  r.bisac_codes = toJson(r.bisac_codes);
  r.meta_keywords = toJson(r.meta_keywords);
  r.related_tags_keywords = toJson(r.related_tags_keywords);
  r.search_keywords = toJson(r.search_keywords);
  if (r.created_at && !(r.created_at instanceof Date)) r.created_at = new Date(r.created_at);
  if (r.updated_at && !(r.updated_at instanceof Date)) r.updated_at = new Date(r.updated_at);
  return r;
}

async function main() {
  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    console.error('Missing POSTGRES_URL in .env. Example: postgresql://user:pass@localhost:5432/bookverse_db');
    process.exit(1);
  }

  const pg = new PgClient({ connectionString: postgresUrl });
  const prisma = new PrismaClient();

  try {
    await pg.connect();
    console.log('Connected to PostgreSQL (source).');
    await prisma.$connect();
    console.log('Connected to MySQL (destination).\n');

    // 1. Books (in batches)
    const booksCount = (await pg.query('SELECT COUNT(*) FROM books')).rows[0].count;
    console.log(`Migrating ${booksCount} books...`);
    let offset = 0;
    let totalBooks = 0;
    while (true) {
      const res = await pg.query(
        `SELECT * FROM books ORDER BY created_at DESC LIMIT ${BATCH_SIZE} OFFSET ${offset}`
      );
      if (res.rows.length === 0) break;
      const rows = res.rows.map(rowToBook);
      try {
        const result = await prisma.books.createMany({ data: rows, skipDuplicates: true });
        totalBooks += result.count;
      } catch (e) {
        for (const row of rows) {
          try {
            await prisma.books.create({ data: row });
            totalBooks++;
          } catch (err) {
            if (err.code === 'P2002') totalBooks++;
            else throw err;
          }
        }
      }
      offset += BATCH_SIZE;
      process.stdout.write(`  Books: ${totalBooks}\r`);
    }
    console.log(`  Books: ${totalBooks} done.\n`);

    // 2. admin_users
    const admins = (await pg.query('SELECT * FROM admin_users')).rows;
    console.log(`Migrating ${admins.length} admin_users...`);
    for (const row of admins) {
      try {
        await prisma.admin_users.create({
          data: {
            id: row.id,
            email: row.email,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
            password_hash: row.password_hash,
          },
        });
      } catch (e) {
        if (e.code === 'P2002') console.warn(`  Skip duplicate admin ${row.email}`);
        else throw e;
      }
    }
    console.log('  admin_users done.\n');

    // 3. bestseller_books (depends on books)
    const bestsellers = (await pg.query('SELECT * FROM bestseller_books ORDER BY added_date')).rows;
    console.log(`Migrating ${bestsellers.length} bestseller_books...`);
    for (const row of bestsellers) {
      try {
        await prisma.bestseller_books.create({
          data: {
            id: row.id,
            book_id: row.book_id,
            asin: row.asin,
            title: row.title,
            author: row.author,
            added_date: row.added_date ? new Date(row.added_date) : undefined,
            sort_order: row.sort_order ?? 0,
            status: row.status ?? 'active',
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
          },
        });
      } catch (e) {
        if (e.code === 'P2002') console.warn(`  Skip duplicate bestseller ${row.id}`);
        else if (e.code === 'P2003') console.warn(`  Skip bestseller (book not found): ${row.book_id}`);
        else throw e;
      }
    }
    console.log('  bestseller_books done.\n');

    // 4. daily_deals
    const deals = (await pg.query('SELECT * FROM daily_deals ORDER BY position')).rows;
    console.log(`Migrating ${deals.length} daily_deals...`);
    for (const row of deals) {
      try {
        await prisma.daily_deals.create({
          data: {
            id: row.id,
            asin: row.asin,
            position: row.position ?? 0,
            is_top_six: !!row.is_top_six,
            is_fixed_position: !!row.is_fixed_position,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
            status: row.status ?? 'active',
          },
        });
      } catch (e) {
        if (e.code === 'P2002') console.warn(`  Skip duplicate deal ${row.id}`);
        else throw e;
      }
    }
    console.log('  daily_deals done.\n');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pg.end();
    await prisma.$disconnect();
  }
}

main();
