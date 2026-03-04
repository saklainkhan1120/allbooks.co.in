# Scalability for 1L+ visitors and searches per day

Rough scale: **1 lakh (100k) visitors/day** ≈ 1–2 requests per second on average; peaks can be 10–50× higher. The app is structured to handle this with caching, indexes, and connection discipline. Below is what’s in place and what to add as you grow.

---

## Already in place

### 1. Server-side caching (Next.js `unstable_cache`)

- **Bestsellers, new releases, just listed, daily deals, genres, authors, publishers** are cached in memory with `revalidate` (30 min–1 hour). Repeated requests are served from cache instead of hitting the DB.
- **Search and filter** use the same cache with a key based on query params, so popular searches are cached.
- **Book detail** pages are cached (e.g. 1 hour).

This greatly reduces database load for listing and detail pages.

### 2. Database indexes (Prisma schema)

- **books**: `asin`, `author`, `created_at`, `main_genre`, `publication_date`, `publisher`, `status`.
- **bestseller_books**: `asin`, `status`.
- **daily_deals**: `asin`, `status`.

These support fast filters, listing order, and lookups by asin/status.

### 3. HTTP cache headers (next.config.js)

- Static assets: long-lived cache.
- API and HTML: `Cache-Control` with `stale-while-revalidate` so CDNs/browsers can serve stale content while revalidating in the background.
- Listing pages (bestsellers, new-releases, etc.): 30 min cache, 2 hr revalidate.

Reduces repeat requests that reach your server.

### 4. Prisma singleton

- A single `PrismaClient` instance is reused (no connection storm). Connection pooling is handled by Prisma/MySQL driver.

### 5. Batched / efficient queries

- Bestsellers and deals use Prisma `findMany` with `include`/`select` (no N+1). Category/author/publisher counts use `groupBy` instead of many small queries.

---

## Recommended for 1L+ visitors

### 1. Connection pool (MySQL)

Add a connection limit to `DATABASE_URL` so one app instance doesn’t open too many connections:

```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
```

Typical value: 5–15 per app instance. If you run multiple instances, ensure:  
`(instances × connection_limit) ≤ MySQL max_connections`.

### 2. Redis for cache (production)

`unstable_cache` is in-memory per process. With multiple instances or serverless, use a shared cache:

- **Vercel**: use Vercel KV (Redis) or similar and a small wrapper that caches hot keys (e.g. genres, bestsellers for page 1) in Redis with a TTL.
- **Self-hosted / MyMilesWeb**: run Redis and cache the same hot paths (e.g. `getGenreCounts`, first page of bestsellers/new releases) with a 30–60 min TTL.

This keeps cache hits high even with many instances and reduces DB load for 1L+ visitors.

### 3. CDN in front

Put a CDN (Cloudflare, Fastly, or your host’s CDN) in front of the app. With the existing `Cache-Control` headers, HTML and API responses can be cached at the edge and revalidated in the background. That cuts latency and load on your Node/MySQL server.

### 4. Rate limiting (optional)

To protect search and filter from abuse, add rate limiting on `/api/books/search` and `/api/books/filter` (e.g. 60–120 requests per minute per IP). Libraries like `@upstash/ratelimit` (Redis) or a simple in-memory rate limiter for single-instance deployments work.

### 5. MySQL tuning

For 100k+ daily traffic, ensure MySQL is tuned:

- **innodb_buffer_pool_size**: large enough to keep hot tables (e.g. `books`, indexes) in memory.
- **max_connections**: at least `(number of app instances × connection_limit) + admin`.
- Consider read replicas later if write volume grows (the app is mostly read-heavy).

---

## Summary

| Area              | Status   | Action for 1L+ visitors                          |
|-------------------|----------|---------------------------------------------------|
| Listing cache     | In place | Add Redis (or similar) for multi-instance/shared cache. |
| Search/filter     | Cached   | Optional: rate limit; ensure DB has RAM/indexes.  |
| DB indexes        | In place | Keep; add composite indexes only if you see slow queries. |
| Connection pool   | Default  | Set `connection_limit` in `DATABASE_URL`.         |
| HTTP caching      | In place | Put a CDN in front; keep current headers.         |
| DB tuning         | —        | Tune MySQL buffer pool and max_connections.       |

The codebase is already optimized for high read traffic (caching, indexes, single Prisma client, no N+1 on main paths). For 1 lakh+ visitors and searches per day, add connection limits, a shared cache (e.g. Redis), and a CDN; then tune MySQL as needed.
