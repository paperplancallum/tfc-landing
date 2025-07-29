-- Create email-images bucket for optimized email images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-images',
  'email-images',
  true,
  1048576, -- 1MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for email-images bucket
-- Allow public to view images
CREATE POLICY "Public can view email images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'email-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated can upload email images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'email-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated can update email images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'email-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated can delete email images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'email-images');