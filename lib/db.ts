import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

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

let client: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!client) client = neon(getConnectionString());
  return client;
}
