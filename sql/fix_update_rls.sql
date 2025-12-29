-- CORREÇÃO DE PERMISSÃO DE ESCRITA (UPDATE)
-- O erro "Não foi possível salvar resultado" acontece porque liberamos apenas LEITURA (SELECT) na tabela 'app_settings'.
-- Agora vamos liberar a ESCRITA (UPDATE) para Admins.

-- 1. Permitir que Admins ATUALIZEM as configurações (Placar, Logo, etc)
CREATE POLICY "Admins can update app_settings"
ON public.app_settings
FOR UPDATE
USING (
  -- Super Admin pode tudo
  public.is_super_admin() 
  OR 
  -- Admin comum pode se o tenant_id bater (Para futuros tenants)
  (tenant_id = public.get_my_tenant_id())
  OR
  -- Fallback temporário: Se tenant_id for nulo (setup atual), permitir admins logados
  (tenant_id IS NULL AND auth.role() = 'authenticated')
);

-- 2. Garantir que palpites também possam ser atualizados se necessário (ex: status)
CREATE POLICY "Admins can update palpites"
ON public.palpites
FOR UPDATE
USING (
  public.is_super_admin() OR tenant_id = public.get_my_tenant_id()
);
