-- 1. Garante que a tabela palpites tem todas as colunas necessárias
ALTER TABLE public.palpites 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS escolha TEXT,
ADD COLUMN IF NOT EXISTS game_date TEXT;

-- 2. Configura Permissões de Segurança (RLS)
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;

-- 3. Permite que QUALQUER pessoa (anon) SALVE um palpite (INSERT)
DROP POLICY IF EXISTS "Qualquer um pode criar palpite" ON public.palpites;
CREATE POLICY "Qualquer um pode criar palpite" 
ON public.palpites FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Permite que o ADMIN (authenticated) veja os palpites (SELECT)
DROP POLICY IF EXISTS "Admin pode ver palpites" ON public.palpites;
CREATE POLICY "Admin pode ver palpites" 
ON public.palpites FOR SELECT 
TO authenticated
USING (true);

-- 5. Garante colunas de configurações
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS team_a_logo_url TEXT,
ADD COLUMN IF NOT EXISTS team_b_logo_url TEXT;

-- 6. Permite Admin atualizar configurações
DROP POLICY IF EXISTS "Admin atualiza config" ON public.app_settings;
CREATE POLICY "Admin atualiza config" 
ON public.app_settings FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);
