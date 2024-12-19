-- 2.schema.sql
-- Enable pgcrypto for UUID generation and crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS listing CASCADE;

CREATE TABLE listing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  data jsonb NOT NULL
);

