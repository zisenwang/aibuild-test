import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData, defaultSession } from '@/lib/auth/session';
import { PROTECTED_ROUTES, PROTECTED_API_ROUTES } from "@/middleware/config";
import { ROUTES } from '@/constants';

async function getSessionFromRequest(request: NextRequest): Promise<SessionData> {
  try {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    return session.isAuthenticated ? session : defaultSession;
  } catch {
    return defaultSession;
  }
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const needsAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
      PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (needsAuth && !session.isAuthenticated) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For pages, redirect to login
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  // Redirect authenticated users away from login
  if (pathname === ROUTES.LOGIN && session.isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}