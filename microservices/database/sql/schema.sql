-- 2.schema.sql
-- Enable pgcrypto for UUID generation and crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the account table
CREATE TABLE account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  restricted boolean NOT NULL DEFAULT false
);