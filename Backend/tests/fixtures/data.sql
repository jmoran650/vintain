-- tests/fixtures/data.sql
-- Global seed data for tests

-- Seed accounts with fixed IDs
INSERT INTO account (id, email, data, restricted)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'sammy@slugmart.com',
    jsonb_build_object(
      'password', crypt('sammyslug', 'hello'),
      'name', jsonb_build_object('first', 'Sammy', 'last', 'Slug'),
      'roles', jsonb_build_array('Shopper','Vendor','Admin'),
      'profile', jsonb_build_object('username', 'sammyslug', 'bio', 'I love shopping.')
    ),
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'test@example.com',
    jsonb_build_object(
      'password', crypt('password', 'hello'),
      'name', jsonb_build_object('first', 'John', 'last', 'Doe'),
      'roles', jsonb_build_array('admin'),
      'profile', jsonb_build_object('username', 'johndoe', 'bio', 'Administrator account.')
    ),
    false
  );

-- Seed listings (using fixed IDs)
INSERT INTO listing (id, owner_id, data)
VALUES
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'brand', 'TestBrand',
      'name', 'TestName',
      'description', 'A test description',
      'imageUrls', ARRAY['http://example.com/image.jpg']
    )
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing (id, owner_id, data)
VALUES
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'brand', 'TestBrand2',
      'name', 'AnotherItem',
      'description', 'Another test description',
      'imageUrls', ARRAY['http://example.com/image2.jpg']
    )
  )
ON CONFLICT (id) DO NOTHING;

-- Seed a message
INSERT INTO message (id, item_owner_id, sender_id, data)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  jsonb_build_object('content', 'Initial test message')
)
ON CONFLICT (id) DO NOTHING;

-- Seed orders
INSERT INTO orders (id, buyer_id, seller_id, shipping_status, item_id, data)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'PENDING',
    '00000000-0000-0000-0000-000000000010',
    jsonb_build_object('notes', 'Sample seeded order #1')
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, buyer_id, seller_id, shipping_status, item_id, data)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'SHIPPED',
    '00000000-0000-0000-0000-000000000011',
    jsonb_build_object('notes', 'Sample seeded order #2')
  )
ON CONFLICT (id) DO NOTHING;