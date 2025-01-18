-- test data in Backend/test/orders/testdata/data.sql
-- Insert some sample orders referencing existing accounts

INSERT INTO orders (id, buyer_id, seller_id, shipping_status, item_id, data)
VALUES
  (
    '11111111-aaaa-bbbb-cccc-222222222222',
    '00000000-b7a7-4100-8b2d-309908b444f5',
    'c3769cbf-4c90-4487-bc5e-476d065b8073',
    'PENDING',
    '33333333-aaaa-bbbb-cccc-444444444444',  -- example itemId
    jsonb_build_object('notes', 'Sample seeded order #1')
  ),
  (
    '22222222-aaaa-bbbb-cccc-333333333333',
    '0c9cd742-bb6c-49d1-9a32-a025249e6357',
    '00000000-b7a7-4100-8b2d-309908b444f5',
    'SHIPPED',
    '55555555-aaaa-bbbb-cccc-666666666666',  -- itemId
    jsonb_build_object('notes', 'Sample seeded order #2')
  );