
// This script is for reference only - columns will be added automatically via the admin page

/*
-- Add team name columns to app_settings if they don't exist
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS team1_name TEXT DEFAULT 'Ponte Preta',
ADD COLUMN IF NOT EXISTS team2_name TEXT DEFAULT 'Guarani';

-- Update existing records
UPDATE public.app_settings 
SET team1_name = 'Ponte Preta', team2_name = 'Guarani'
WHERE team1_name IS NULL OR team2_name IS NULL;
*/
