export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { paths, tags } = await request.json();

    console.log('🔄 Cache invalidation request received:', { paths, tags });

    // Invalidate page paths
    if (paths && Array.isArray(paths)) {
      await Promise.all(
        paths.map(async (path: string) => {
          try {
            await revalidatePath(path);
            console.log(`✅ Page cache invalidated: ${path}`);
          } catch (error) {
            console.error(`❌ Failed to invalidate page cache: ${path}`, error);
          }
        })
      );
    }

    // Invalidate data tags
    if (tags && Array.isArray(tags)) {
      await Promise.all(
        tags.map(async (tag: string) => {
          try {
            await revalidateTag(tag);
            console.log(`✅ Data cache invalidated: ${tag}`);
          } catch (error) {
            console.error(`❌ Failed to invalidate data cache: ${tag}`, error);
          }
        })
      );
    }

    console.log('🎯 Cache invalidation completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidation completed',
      invalidatedPaths: paths || [],
      invalidatedTags: tags || []
    });

  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cache invalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for testing cache invalidation
export async function GET() {
  return NextResponse.json({ 
    message: 'Cache invalidation API endpoint',
    usage: 'POST with { paths: string[], tags: string[] }'
  });
} 