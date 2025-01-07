-- 3.data.sql

INSERT INTO listing (id, owner_id, data)
VALUES (
  '00000000-b7a7-4100-8b2d-309908b444f5',
  '00000000-b7a7-4100-8b2d-309908b444f5', 
  jsonb_build_object(
    'brand', 'TestBrand',
    'name', 'TestName',
    'description', 'A test description',
    'imageUrls', jsonb_build_array('http://example.com/testimg.jpg')
  )
);
