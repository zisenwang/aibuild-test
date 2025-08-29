import dotenv from 'dotenv';

// Load .env file for development
dotenv.config();

export const devEnv = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: "development" as const,
};