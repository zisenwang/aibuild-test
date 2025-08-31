import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData, defaultSession } from './session';
import { ROUTES } from '@/constants';

// Get session data (server-side)
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  if (!session.isAuthenticated) {
    return defaultSession;
  }
  
  return session;
}

// Require authentication (redirect if not logged in)
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session.isAuthenticated) {
    redirect(ROUTES.LOGIN);
  }
  
  return session;
}

// Login helper
export async function createSession(userId: string, username: string) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.userId = userId;
  session.username = username;
  session.isAuthenticated = true;
  await session.save();
}

// Logout helper
export async function destroySession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
}