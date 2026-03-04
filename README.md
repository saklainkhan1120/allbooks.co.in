This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (MySQL)

This app uses **MySQL** (not PostgreSQL). Before running:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your MySQL connection string (e.g. `mysql://user:password@localhost:3306/database`).
2. Ensure MySQL is running and the database/user exist.
3. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

If you see `PrismaClientInitializationError` or "Invalid invocation", the app cannot connect to the database—check the steps above.

- **Data in PostgreSQL?** See **DATA_MIGRATION.md** to copy data from Postgres to MySQL (one-time script).
- **MIGRATION_STATUS.md** – PostgreSQL → MySQL migration details.
- **MYMILESWEB_DEPLOYMENT.md** – Hosting on MyMilesWeb.
- **SCALABILITY.md** – Optimizations for 1L+ visitors/day.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
