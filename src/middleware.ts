import { authMiddleware } from './middleware/auth';

export { authMiddleware as middleware };

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and auth API
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};