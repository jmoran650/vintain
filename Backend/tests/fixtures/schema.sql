-- tests/fixtures/schema.sql
-- Production schema for all tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS listing CASCADE;
DROP TABLE IF EXISTS account CASCADE;

-- Account table
CREATE TABLE account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  restricted boolean NOT NULL DEFAULT false
);

-- Listing table
CREATE TABLE listing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  data jsonb NOT NULL
);

-- Message table
CREATE TABLE message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_owner_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  data jsonb NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  shipping_status text NOT NULL DEFAULT 'pending',
  item_id uuid NOT NULL,
  data jsonb,
  CONSTRAINT fk_order_buyer
    FOREIGN KEY (buyer_id)
    REFERENCES account (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_seller
    FOREIGN KEY (seller_id)
    REFERENCES account (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_item
    FOREIGN KEY (item_id)
    REFERENCES listing (id)
);