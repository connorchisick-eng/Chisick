import { neon } from "@neondatabase/serverless";

/**
 * Shared Neon client. Reads the Postgres connection string from the
 * Vercel-Neon integration env vars (populated automatically when the
 * database is connected to the project). Falls back across variable
 * names because Vercel's integration has shipped different ones over
 * the years.
 */
function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) {
    throw new Error(
      "No Postgres connection string found. Expected DATABASE_URL or POSTGRES_URL in the environment.",
    );
  }
  return url;
}

export const sql = neon(getConnectionString());
