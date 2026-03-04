import { PrismaClient } from '@prisma/client';

// Singleton for Next.js: prevents multiple PrismaClient instances and connection exhaustion.
// Requires: DATABASE_URL set (MySQL), MySQL running, and run `npx prisma generate` after schema changes.
const prismaClientSingleton = () => new PrismaClient();

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
