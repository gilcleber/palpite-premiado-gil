-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Separate storage setup (Supabase Storage is usually handled via API/Dashboard, but we can set policies if the bucket exists)
-- We assume the user needs to create the bucket 'images' manually or we try to insert into storage.buckets if permissions allow.
-- Since we can't easily create buckets via SQL in all Supabase setups without extensions, we will instruct the user or assume it works if we use the standard 'public' bucket logic or try to insert.

-- Let's try to insert the bucket if it doesn't exist (this works in self-hosted or if appropriate extensions are enabled, otherwise user might need to create it in dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing images (public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Policy for uploading images (anyone for now, or admin only if we had auth set up perfectly for RLS on storage, but for now allow authenticated generic)
-- Ideally we restrict to admin, but let's allow authenticated users (our method uses client key)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Enable RLS on prizes
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Prizes are public" ON prizes FOR SELECT USING (true);

-- Allow write access to authenticated users (admins)
CREATE POLICY "Admins can manage prizes" ON prizes FOR ALL USING (auth.role() = 'authenticated');
