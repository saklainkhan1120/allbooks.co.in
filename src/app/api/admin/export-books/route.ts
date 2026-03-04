import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Local serializer to make Prisma BigInt/Decimal JSON-safe
function serialize(value: unknown): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(serialize);
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Prisma Decimal has toString; fall back to value as-is if fails
      if (v && typeof (v as any).toNumber === 'function') {
        try { out[k] = (v as any).toNumber(); continue; } catch {}
      }
      out[k] = serialize(v);
    }
    return out;
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, genre, author, publisher, limit = 1000 } = body || {};

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (genre && genre !== 'all') where.main_genre = genre;
    if (author) where.author = { contains: author };
    if (publisher) where.publisher = { contains: publisher };

    const data = await prisma.books.findMany({
      where,
      take: Math.min(Number(limit) || 1000, 10000),
      orderBy: { created_at: 'desc' },
    });

    const safe = serialize(data);
    return NextResponse.json({ success: true, count: data.length, data: safe });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export query failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


