-- CORREÇÃO DE ACESSO AO PERFIL (FIM DO LOADING INFINITO)
-- Este script permite que o sistema LEIA quem você é.
-- Sem isso, o site entra em loop "Verificando permissões...".

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Permitir que o usuário leia SEU PRÓPRIO perfil
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can view own admin profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Permitir que super admin leia todos (para gerenciar)
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
CREATE POLICY "Super Admins can view all profiles" 
ON public.admin_profiles 
FOR SELECT 
USING (public.is_super_admin());

-- 3. Liberar leitura da tabela 'tenants' (Rádio) para admins saberem de qual rádio são
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
CREATE POLICY "Admins can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (
  id IN (SELECT tenant_id FROM public.admin_profiles WHERE id = auth.uid())
  OR public.is_super_admin()
);
