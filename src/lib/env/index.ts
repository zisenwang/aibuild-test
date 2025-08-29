import { devEnv } from './env.dev';
import { prodEnv } from './env.prod';

const isDev = process.env.NODE_ENV !== 'production';

export const env = isDev ? devEnv : prodEnv;

// Log environment info when module loads (server-side only)
if (typeof window === 'undefined') {
  console.log('🔧 Environment Configuration:');
  console.log('   NODE_ENV:', env.NODE_ENV);
  console.log('   DATABASE_URL loaded:', !!env.DATABASE_URL);
  console.log('   Environment source:', isDev ? 'env.dev.ts (.env file)' : 'env.prod.ts (system env)');
}