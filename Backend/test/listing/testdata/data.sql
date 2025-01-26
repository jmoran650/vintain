
-- Insert the specific listing your "Can get listing by ID" test expects:
-- 00000000-b7a7-4100-8b2d-309908b444f5
INSERT INTO listing (id, owner_id, data)
VALUES (
  '00000000-b7a7-4100-8b2d-309908b444f5',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'brand', 'TestBrand',
    'name', 'TestName',
    'description', 'A test description',
    'imageUrls', ARRAY['http://example.com/image.jpg']
  )
)
ON CONFLICT (id) DO NOTHING;

-- Insert a second listing also containing "test" in brand/description,
-- ensuring "searchListings" can return multiple matches for "test".
INSERT INTO listing (id, owner_id, data)
VALUES (
  '11111111-b7a7-4100-8b2d-309908b444f5',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'brand', 'TestBrand2',
    'name', 'AnotherItem',
    'description', 'Another test description',
    'imageUrls', ARRAY['http://example.com/image2.jpg']
  )
)
ON CONFLICT (id) DO NOTHING;

-- Insert a third listing that DOES NOT have the word "test" anywhere,
-- so your negative search test can confirm zero results for queries like "xyzzznotfound".
INSERT INTO listing (id, owner_id, data)
VALUES (
  '22222222-b7a7-4100-8b2d-309908b444f5',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'brand', 'UniqueBrand',
    'name', 'DifferentItem',
    'description', 'Does not contain test keyword',
    'imageUrls', ARRAY['http://example.com/image3.jpg']
  )
)
ON CONFLICT (id) DO NOTHING;