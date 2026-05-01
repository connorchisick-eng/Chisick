import { neon } from "@neondatabase/serverless";

function connectionString() {
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

const sql = neon(connectionString());

console.log("[waitlist] running migration");

await sql`
  CREATE TABLE IF NOT EXISTS waitlist (
    id          SERIAL PRIMARY KEY,
    name        TEXT,
    email       TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent  TEXT,
    referer     TEXT
  )
`;

await sql`ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email TEXT`;
await sql`ALTER TABLE waitlist ALTER COLUMN phone DROP NOT NULL`;
await sql`UPDATE waitlist SET email = lower(trim(email)) WHERE email IS NOT NULL`;

await sql`
  WITH ranked AS (
    SELECT
      id,
      row_number() OVER (
        PARTITION BY lower(email)
        ORDER BY created_at ASC, id ASC
      ) AS row_num
    FROM waitlist
    WHERE email IS NOT NULL AND trim(email) <> ''
  )
  DELETE FROM waitlist
  USING ranked
  WHERE waitlist.id = ranked.id
    AND ranked.row_num > 1
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_unique_idx
  ON waitlist (lower(email))
`;
await sql`CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email)`;
await sql`CREATE INDEX IF NOT EXISTS waitlist_phone_idx ON waitlist (phone)`;

console.log("[waitlist] migration complete");
