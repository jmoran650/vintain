CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS message CASCADE;

CREATE TABLE message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_owner_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  data jsonb NOT NULL
);