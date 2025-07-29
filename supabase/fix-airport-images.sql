-- Create a function to update airport images
CREATE OR REPLACE FUNCTION update_airport_image(p_iata_code TEXT, p_image_url TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE airports
  SET city_image_url = p_image_url
  WHERE iata_code = p_iata_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated
GRANT EXECUTE ON FUNCTION update_airport_image TO anon;
GRANT EXECUTE ON FUNCTION update_airport_image TO authenticated;

-- Alternative: Disable RLS temporarily (if you have admin access)
-- ALTER TABLE airports DISABLE ROW LEVEL SECURITY;

-- Or add a policy to allow updates
CREATE POLICY "Allow public to update city_image_url" ON airports
FOR UPDATE TO public
USING (true)
WITH CHECK (true);

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'airports';