-- MASTER RESET (VERSÃO SEGURA - RODAR TUDO)
-- Este script limpa o banco e prepara automação para criação de admins.

-- 1. LIMPEZA (Pode dar erro se tabelas estiverem vazias, ignore)
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.admin_profiles CASCADE;
TRUNCATE TABLE public.tenants CASCADE;

-- 2. FUNÇÃO: Verificar Super Admin (Sem Loop)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 'SELECT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = ''super_admin'');';

-- 3. FUNÇÃO: Obter Tenant ID (Sem Loop)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 'SELECT tenant_id FROM admin_profiles WHERE id = auth.uid();';

-- 4. FUNÇÃO DE AUTOMAÇÃO (CRIA O PERFIL QUANDO O USUÁRIO CADASTRA)
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Criar Rádio Principal se não existir
  INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
  VALUES ('Rádio Principal', 'radio-principal', NEW.email, 'active', NOW() + INTERVAL '10 years')
  ON CONFLICT (slug) DO UPDATE SET owner_email = NEW.email
  RETURNING id INTO new_tenant_id;

  -- Fallback se ID voltar nulo
  IF new_tenant_id IS NULL THEN
    SELECT id INTO new_tenant_id FROM public.tenants WHERE slug = 'radio-principal';
  END IF;

  -- Criar Perfil de Super Admin
  INSERT INTO public.admin_profiles (id, role, tenant_id)
  VALUES (NEW.id, 'super_admin', new_tenant_id)
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', tenant_id = new_tenant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER (Vincular automação)
DROP TRIGGER IF EXISTS on_admin_user_inserted ON public.admin_users;
CREATE TRIGGER on_admin_user_inserted
AFTER INSERT ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- 6. PERMISSÕES (RLS) - Destravar leitura

-- ADMIN PROFILES
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can view own admin profile" ON public.admin_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
CREATE POLICY "Super Admins can view all profiles" ON public.admin_profiles FOR SELECT USING (public.is_super_admin());

-- TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
CREATE POLICY "Admins can view their own tenant" ON public.tenants FOR SELECT USING (id = public.get_my_tenant_id() OR public.is_super_admin());

-- APP SETTINGS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update app_settings" ON public.app_settings;
CREATE POLICY "Admins can update app_settings" ON public.app_settings FOR UPDATE USING (
  public.is_super_admin() OR tenant_id = public.get_my_tenant_id() OR (tenant_id IS NULL AND auth.role() = 'authenticated')
);

-- 7. APAGAR USUÁRIO ANTIGO (Tentativa final de renomear para liberar email)
UPDATE auth.users 
SET email = 'deleted_' || floor(random()*999999) || '@deleted' 
WHERE email = 'gilcleberlocutor@gmail.com';
