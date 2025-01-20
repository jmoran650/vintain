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

DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The account who placed the order
  buyer_id uuid NOT NULL,
  
  -- The account (shop or seller) fulfilling the order
  seller_id uuid NOT NULL,
  
  -- For now, we’ll store an order or shipping status as a simple text column
  shipping_status text NOT NULL DEFAULT 'pending',

  item_id uuid NOT NULL,
  
  -- Possibly a JSONB for extra data (items, totals, addresses, etc.)
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
    --No on delete cascade as far as I can tell idk why an order would ever be deleted
);