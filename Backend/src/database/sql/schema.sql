-- 2.schema.sql
-- Enable pgcrypto for UUID generation and crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS account CASCADE;
-- Create the account table
CREATE TABLE account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  restricted boolean NOT NULL DEFAULT false
);

CREATE TABLE listing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  data jsonb NOT NULL
);

CREATE TABLE message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_owner_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  data jsonb NOT NULL
);

