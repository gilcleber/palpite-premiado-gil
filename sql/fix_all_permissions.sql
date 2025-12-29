-- CORREÇÃO GERAL SCRIPT (FORMATADO)
-- Se der erro de "dollar-quoted", tente rodar bloco por bloco.

-- 1. Função: Checar se é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$;

-- 2. Função: Pegar ID do Tenant
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tid UUID;
BEGIN
  SELECT tenant_id INTO tid FROM public.admin_profiles WHERE id = auth.uid();
  RETURN tid;
END;
$$;

-- 3. Configurações (App Settings)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update app_settings" ON public.app_settings;
CREATE POLICY "Admins can update app_settings" ON public.app_settings FOR UPDATE USING (
  public.is_super_admin() 
  OR 
  tenant_id = public.get_my_tenant_id() 
  OR 
  (tenant_id IS NULL AND auth.role() = 'authenticated')
);

-- 4. Prêmios (Prizes)
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read prizes" ON public.prizes;
CREATE POLICY "Public read prizes" ON public.prizes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage prizes" ON public.prizes;
CREATE POLICY "Admins manage prizes" ON public.prizes FOR ALL USING (
  public.is_super_admin() 
  OR 
  tenant_id = public.get_my_tenant_id()
  OR 
  (tenant_id IS NULL AND auth.role() = 'authenticated')
);

-- 5. Palpites
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert palpites" ON public.palpites;
CREATE POLICY "Public insert palpites" ON public.palpites FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage palpites" ON public.palpites;
CREATE POLICY "Admins manage palpites" ON public.palpites FOR ALL USING (
  public.is_super_admin() 
  OR 
  tenant_id = public.get_my_tenant_id()
  OR 
  (tenant_id IS NULL AND auth.role() = 'authenticated')
);
