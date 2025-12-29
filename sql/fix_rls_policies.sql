-- CORREÇÃO DE PERMISSÕES (RLS)
-- O sistema estava bloqueando a leitura dos dados do admin pq ativamos a segurança mas não criamos as regras de acesso.

-- 1. Permitir que o usuário veja seu próprio perfil de Admin
CREATE POLICY "Users can view their own admin profile" 
ON public.admin_profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Permitir que Super Admins vejam todos os perfis (para a lista de licenças)
CREATE POLICY "Super Admins can view all profiles" 
ON public.admin_profiles
FOR ALL
USING (
  (SELECT role FROM public.admin_profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 3. Permitir que Admins vejam os dados da sua própria Rádio (Tenant)
CREATE POLICY "Admins can view their own tenant" 
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tenant_id FROM public.admin_profiles WHERE id = auth.uid()
  )
);

-- 4. Permitir que Super Admins vejam todas as Rádios
CREATE POLICY "Super Admins can view all tenants" 
ON public.tenants
FOR ALL
USING (
  (SELECT role FROM public.admin_profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 5. Garantir que a leitura de 'app_settings' funcione para a rádio correta
CREATE POLICY "Public read access to branded app_settings"
ON public.app_settings
FOR SELECT
USING (true); 
-- Nota: Em um SaaS real, filtraríamos por domínio/slug aqui, mas por enquanto liberamos leitura para a home page funcionar.
