-- LIBERAR CADASTRO DE ADMIN 🔓
-- Este script garante que qualquer um (anonimo ou logado) possa se declarar admin
-- na tabela pública 'admin_users' durante o cadastro.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Permitir SELECT público (necessário para checar se já existe)
DROP POLICY IF EXISTS "Public read admin_users" ON public.admin_users;
CREATE POLICY "Public read admin_users" ON public.admin_users FOR SELECT USING (true);

-- 2. Permitir INSERT público (necessário para o primeiro cadastro)
-- (limitado via aplicação, mas essencial para o fluxo funcionar)
DROP POLICY IF EXISTS "Public insert admin_users" ON public.admin_users;
CREATE POLICY "Public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

-- 3. Permitir UPDATE pelo próprio usuário
DROP POLICY IF EXISTS "Users update own admin_users" ON public.admin_users;
CREATE POLICY "Users update own admin_users" ON public.admin_users FOR UPDATE USING (auth.uid() = id);

RAISE NOTICE 'RLS corrigido: admin_users agora aceita novos cadastros.';
