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


INSERT INTO account (email, data, restricted)
VALUES 
  (
    'test@example.com',
    jsonb_build_object(
      'password', crypt('password', 'hello'),
      'name', jsonb_build_object('first','John','last','Doe'),
      'roles', jsonb_build_array('admin')
    ),
    false
  ),
  (
    'jane@example.com',
    jsonb_build_object(
      'password', crypt('secret', 'hello'),
      'name', jsonb_build_object('first','Jane','last','Smith'),
      'roles', jsonb_build_array('user')
    ),
    false
  ),
  (
    'mark@example.com',
    jsonb_build_object(
      'password', crypt('mypassword', 'hello'),
      'name', jsonb_build_object('first','Mark','last','Johnson'),
      'roles', jsonb_build_array('user','editor')
    ),
    false
  );