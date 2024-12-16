-- 3.data.sql
INSERT INTO account (email, data, restricted)
VALUES (
  'test@example.com',
  jsonb_build_object(
    'password', crypt('password', 'hello'), 
    'name', jsonb_build_object('first','John','last','Doe'),
    'roles', jsonb_build_array('admin')
  ),
  false
);