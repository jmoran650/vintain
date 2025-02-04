-- 3.data.sql

INSERT INTO account (email, data, restricted)
VALUES 
  (
    'test@example.com',
    jsonb_build_object(
      'password', crypt('password', 'hello'),
      'name', jsonb_build_object('first','John','last','Doe'),
      'username': 'deez'
      'roles', jsonb_build_array('admin')
    ),
    false
  ),
  (
    'janet@example.com',
    jsonb_build_object(
      'password', crypt('secret', 'hello'),
      'name', jsonb_build_object('first','Jane','last','Smith'),
      'roles', jsonb_build_array('user')
    ),
    false
  ),
  (
    'market@example.com',
    jsonb_build_object(
      'password', crypt('mypassword', 'hello'),
      'name', jsonb_build_object('first','Mark','last','Johnson'),
      'roles', jsonb_build_array('user','editor')
    ),
    false
  );

INSERT INTO account(id, email, data) VALUES ('00000000-b7a7-4100-8b2d-309908b444f5', 'sammy@slugmart.com', jsonb_build_object(    'name', jsonb_build_object(        'first', 'Sammy',       'last', 'Slug'),    'password', crypt('sammyslug', 'DCozzICfOJVtSpwH'),    'roles', '["Shopper","Vendor","Admin"]'::jsonb));
INSERT INTO account(id, email, data) VALUES ('c3769cbf-4c90-4487-bc5e-476d065b8073', 'santiago@sales.com', jsonb_build_object(    'name', jsonb_build_object(        'first', 'Santiago',       'last', 'Salesman'),    'password', crypt('sammysalesman', 'DCozzICfOJVtSpwH'),    'roles', '["Vendor"]'::jsonb));
INSERT INTO account(id, email, data) VALUES ('0c9cd742-bb6c-49d1-9a32-a025249e6357', 'veronica@vendor.com', jsonb_build_object(    'name', jsonb_build_object(        'first', 'Veronica',       'last', 'Vendor'),    'password', crypt('veronicavendor', 'DCozzICfOJVtSpwH'),    'roles', '["Vendor"]'::jsonb));

