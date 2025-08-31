import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  username?: string;
  isAuthenticated: boolean;
}

export const defaultSession: SessionData = {
  isAuthenticated: false,
};

// Ensure SESSION_SECRET exists
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: 'retail-insights-session',
  cookieOptions: {
    // secure: true in production (HTTPS), false in development (HTTP)
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'lax', // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};