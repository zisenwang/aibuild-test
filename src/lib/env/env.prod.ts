export const prodEnv = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: "production" as const,
};