-- MATADOR DE ZUMBIS (KILL ZOMBIES) 🧟‍♂️
-- Seu sistema está num estado "Zumbi": A tabela diz que tem admin, mas o login diz que não tem.
-- Vamos forçar o esvaziamento da tabela teimosa.

BEGIN;

-- 1. Esvaziar tabela de admins na força bruta
TRUNCATE TABLE public.admin_users CASCADE;

-- 2. Esvaziar perfis
TRUNCATE TABLE public.admin_profiles CASCADE;

-- 3. Esvaziar tenants
TRUNCATE TABLE public.tenants CASCADE;

COMMIT;

-- Se o comando acima der erro, tente rodar apenas esta linha sozinha:
-- TRUNCATE TABLE public.admin_users CASCADE;
