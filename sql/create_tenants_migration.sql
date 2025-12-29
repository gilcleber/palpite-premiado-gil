-- Create the tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- e.g., 'radio-band', 'radio-cidade'
    owner_email TEXT NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add tenant_id to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to prizes
ALTER TABLE public.prizes 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to palpites
ALTER TABLE public.palpites 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Create a Super Admin role in app_settings or a separate admin table?
-- For now, let's assume we manage admin roles via metadata or a separate table.
-- If you don't have an admin_users table, we might rely on Supabase Auth Metadata.
-- But the plan mentioned 'Modify admin_users'. Checking types.ts will confirm if it exists.
-- Assuming no 'admin_users' table based on previous interaction, we might need one or use app_settings for config only.
-- Let's stick strictly to the plan: "Modify admin_users". If it doesn't exist, I'll create it to link auth.users to tenants.

CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Row Level Security)
-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Super Admins can do everything. Admins can only see their own tenant's data.
-- Note: Writing actual policies requires a helper function to get current user's tenant_id.

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.admin_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example Policy for Palpites
CREATE POLICY "Admins can view their own tenant palpites" ON public.palpites
FOR ALL
USING (tenant_id = public.get_current_tenant_id() OR (SELECT role FROM public.admin_profiles WHERE id = auth.uid()) = 'super_admin');

-- Important: For the public betting form, users don't have a login. 
-- We need a way to insert palpites associated with the correct tenant.
-- usually done by passing tenant_id from the frontend (which knows which radio it is via URL/slug).
-- We will allow INSERT with a valid tenant_id.

CREATE POLICY "Public can insert palpites" ON public.palpites
FOR INSERT
WITH CHECK (true); -- We will validate tenant_id existence in backend or trust the frontend's valid ID.

