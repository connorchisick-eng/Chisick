import { neon } from "@neondatabase/serverless";

/**
 * Shared Neon client. Reads the Postgres connection string from the
 * Vercel-Neon integration env vars (populated automatically when the
 * database is connected to the project). Falls back across variable
 * names because Vercel's integration has shipped different ones over
 * the years.
 *
 * Lazy: the connection string isn't read until the first query.
 * Without this, Next's "Collecting page data" build step crashes on
 * deployments where the env var isn't set yet (e.g. a fresh project).
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

let _client: ReturnType<typeof neon> | null = null;
function getClient(): ReturnType<typeof neon> {
  if (!_client) _client = neon(getConnectionString());
  return _client;
}

// Re-export with the same tagged-template shape so callers don't change.
export const sql = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => (getClient() as unknown as (s: TemplateStringsArray, ...v: unknown[]) => unknown)(
  strings,
  ...values,
)) as ReturnType<typeof neon>;
