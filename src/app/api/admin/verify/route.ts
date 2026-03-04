export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await db.admin.verifyLogin(email, password);
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        id: result.data.id,
        email: result.data.email,
        created_at: result.data.created_at
      }
    });
    
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
