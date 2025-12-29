-- Add branding columns to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS radio_logo_url TEXT,
ADD COLUMN IF NOT EXISTS radio_slogan TEXT;

-- Update the types if you are using Supabase CLI to generate types
-- npx supabase gen types typescript --project-id "your-project-id" > src/integrations/supabase/types.ts
