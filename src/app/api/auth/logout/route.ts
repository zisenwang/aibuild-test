import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth';
import { getClientIP } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Get current session info for logging
    const session = await getSession();
    
    // Destroy session
    await destroySession();
    
    // Log successful logout
    if (session.isAuthenticated) {
      console.log(`[LOGOUT] User logged out - Username: ${session.username}, IP: ${clientIP}`);
    } else {
      console.log(`[LOGOUT] Logout attempt from non-authenticated user, IP: ${clientIP}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error(`[LOGOUT] Error from IP ${clientIP}:`, error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}