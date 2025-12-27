
// This script is for reference only
// It shows how to create a default admin user in Supabase
// You need to run this in the Supabase SQL Editor

/*
-- First, create a user via the auth API
-- Sign up with email: gil@admin.com and password: mudar1234 using the Supabase interface
-- Or run this in the SQL Editor:

-- Insert the user into auth.users (Note: in production, you'd use the auth API instead)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at
)
VALUES (
  gen_random_uuid(), 'gil@admin.com', 
  crypt('mudar1234', gen_salt('bf')), 
  now(), now(), now()
);

-- Get the user ID
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID for the admin user
  SELECT id INTO user_id FROM auth.users WHERE email = 'gil@admin.com';
  
  -- Add the user to the admin_users table
  INSERT INTO public.admin_users (id, email) 
  VALUES (user_id, 'gil@admin.com');
END
$$;
*/
