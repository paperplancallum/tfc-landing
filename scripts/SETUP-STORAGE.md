# Setting Up Supabase Storage for City Images

The city images upload requires proper configuration of Supabase Storage. Follow these steps:

## Option 1: Update Storage Policies (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to Storage > Policies
3. Find the "city-images" bucket
4. Add these policies:

### INSERT Policy (for uploads)
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'city-images');

-- OR for development, allow all uploads (less secure)
CREATE POLICY "Allow all uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'city-images');
```

### SELECT Policy (for public access)
```sql
-- Allow public to view images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'city-images');
```

## Option 2: Use Service Role Key

1. Go to Settings > API in your Supabase Dashboard
2. Copy the `service_role` key (this bypasses RLS)
3. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
4. Run the original script: `npx tsx scripts/upload-city-images.ts`

## Option 3: Manual Upload via Dashboard

1. Download images locally first
2. Go to Storage in Supabase Dashboard
3. Upload images manually to the city-images bucket
4. Run a script to update the database with the URLs

## Security Note

For production, you should:
- Use service role key only in secure server environments
- Never expose service role key to client-side code
- Set up proper RLS policies based on your auth requirements