-- Add alarm_code column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS alarm_code TEXT;

-- Update store_contents table to support bullet points
-- First, modify the content_type check constraint to include 'bullet-list'
ALTER TABLE store_contents DROP CONSTRAINT IF EXISTS store_contents_content_type_check;
ALTER TABLE store_contents ADD CONSTRAINT store_contents_content_type_check 
  CHECK (content_type IN ('text', 'image', 'bullet-list'));

-- Add bullet_points column as JSONB to store array of strings
ALTER TABLE store_contents ADD COLUMN IF NOT EXISTS bullet_points JSONB;

-- Update RLS policies to allow public access (no authentication required)
-- For stores table
DROP POLICY IF EXISTS "Allow authenticated users to insert stores" ON stores;
DROP POLICY IF EXISTS "Allow authenticated users to update stores" ON stores;
DROP POLICY IF EXISTS "Allow authenticated users to delete stores" ON stores;

CREATE POLICY "Allow public access for stores" 
  ON stores FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For store_images table
DROP POLICY IF EXISTS "Allow authenticated users to insert store images" ON store_images;
DROP POLICY IF EXISTS "Allow authenticated users to update store images" ON store_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete store images" ON store_images;

CREATE POLICY "Allow public access for store images" 
  ON store_images FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For store_contents table
DROP POLICY IF EXISTS "Allow authenticated users to insert store contents" ON store_contents;
DROP POLICY IF EXISTS "Allow authenticated users to update store contents" ON store_contents;
DROP POLICY IF EXISTS "Allow authenticated users to delete store contents" ON store_contents;

CREATE POLICY "Allow public access for store contents" 
  ON store_contents FOR ALL 
  USING (true) 
  WITH CHECK (true);
