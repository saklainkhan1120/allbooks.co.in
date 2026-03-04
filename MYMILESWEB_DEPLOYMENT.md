# Deploy Bookverse Next.js on MyMilesWeb (MilesWeb)

This guide covers hosting your Bookverse Next.js app on **MyMilesWeb** (MilesWeb) with **MySQL** and Node.js.

## Prerequisites

- A MyMilesWeb hosting account with **Node.js** and **MySQL** (e.g. Max, Cloud Pro, or Cloud Boost plan).
- Your app uses **MySQL** (see `prisma/schema.prisma`) and reads `DATABASE_URL` from the environment.

## 1. Create MySQL database on MyMilesWeb

1. Log in to **cPanel** (or your control panel).
2. Open **MySQL Databases**.
3. Create a new database (e.g. `bookverse_db`).
4. Create a MySQL user and assign it to this database (all privileges).
5. Note: **host** (often `localhost`), **database name**, **username**, **password**.  
   Your connection URL will look like:
   ```text
   mysql://USERNAME:PASSWORD@HOST/DATABASE_NAME
   ```
   Example: `mysql://bookverse_user:YourSecurePass@localhost/bookverse_db`  
   If the panel shows a different host (e.g. `mysql.yourdomain.com`), use that instead of `localhost`.

## 2. Set environment variables on MyMilesWeb

1. In cPanel, find **Application Manager** / **Node.js App** (or the section where you configure your Node app).
2. Add environment variables for your app. At minimum:
   - **DATABASE_URL** = `mysql://USERNAME:PASSWORD@HOST/DATABASE_NAME`  
     (use the values from step 1; no spaces, special characters in password should be URL-encoded).
   - **NODE_ENV** = `production`
3. If your app uses a public URL (e.g. for links or OAuth), set **NEXT_PUBLIC_SITE_URL** to your live URL (e.g. `https://yourdomain.com`).

## 3. Deploy the app (Git + build on server)

1. **Upload or clone the project**
   - **Option A – Git (recommended)**  
     In cPanel / Terminal / SSH, clone your repo into the folder that will serve the app, e.g.:
     ```bash
     cd /home/youruser
     git clone https://github.com/purbeyank/allbooknextjshostingerVPS.git bookverse
     cd bookverse
     ```
   - **Option B – Upload**  
     Upload the project (e.g. via File Manager or SFTP) to the same folder.

2. **Install dependencies and build**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run build
   ```
   - If the panel uses a different Node version, switch first (e.g. `nvm use 18` or the version your plan supports).
   - `prisma db push` creates/updates MySQL tables from `prisma/schema.prisma` (no PostgreSQL required).

3. **Start the app**
   - In **Application Manager** / **Node.js App**, set:
     - **Application root**: folder that contains `package.json` (e.g. `bookverse` or `.`).
     - **Application startup file**: leave as default or set to the script that runs the app (e.g. `node_modules/next/dist/bin/next start` or the start command below).
   - Or from SSH, run (adjust port if your host requires it):
     ```bash
     npm run start
     ```
     Or:
     ```bash
     npx next start -p 3000
     ```
   - If the panel has a “Start” / “Restart” button for the Node app, use it after saving env vars and startup file.

## 4. Point domain to the Node app

- In cPanel, use **Domains** / **Addon Domains** or **Subdomains** and point the domain (or subdomain) to the folder where the app runs.
- If the panel has a “Setup Application” or “Create Application” for Node.js, use it to bind the domain and port (e.g. 3000) and optionally enable a process manager.

## 5. Post-deploy checks

- Open `https://yourdomain.com` and confirm the site loads.
- Test search, filters, and any feature that uses the database.
- If you see DB errors, double-check **DATABASE_URL** (correct host, user, password, database name; no typos; password URL-encoded if it has `#`, `@`, etc.).

## 6. Optional: run migrations instead of `db push`

For production you may prefer migrations:

```bash
npx prisma migrate deploy
```

Run this after the first `prisma db push` only if you later introduce migrations under `prisma/migrations` and want to use them on MyMilesWeb.

## 7. Troubleshooting

| Issue | What to check |
|--------|----------------|
| “Unknown database” / connection refused | Correct **DATABASE_URL**; MySQL service running; user has access to the database. |
| “Unknown argument `mode`” in Prisma | You must use **MySQL** (this project is configured for MySQL). Do not use PostgreSQL-only options. |
| App not starting | Node version (e.g. 18+); `npm run build` succeeded; startup file and application root set correctly in the panel. |
| 502 / “Bad Gateway” | Node process not running or wrong port; reverse proxy (if any) pointing to the correct port. |

## Summary

- **Database**: MySQL on MyMilesWeb (create DB and user in cPanel, set **DATABASE_URL**).
- **App**: Node.js + Next.js; deploy via Git or upload, then `npm install`, `prisma generate`, `prisma db push`, `npm run build`, `npm run start` (or panel’s Node.js app settings).
- **Env**: `DATABASE_URL`, `NODE_ENV=production`, and optionally `NEXT_PUBLIC_SITE_URL`.

For plan limits (Node apps, MySQL DBs, connections), see [MilesWeb Node.js hosting](https://www.milesweb.com/nz/hosting/nodejs-hosting) or your plan details.
