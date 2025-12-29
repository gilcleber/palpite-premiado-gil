-- Add team name columns to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS team_a TEXT DEFAULT 'Time A',
ADD COLUMN IF NOT EXISTS team_b TEXT DEFAULT 'Time B';

-- Update RLS again just to be safe (though previous policy likely covers it if it was FOR UPDATE)
-- The previous policy was: ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- This implicitly covers new columns.
