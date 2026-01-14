import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn, Shield, ShieldCheck, KeyRound } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Contexts
  const { signIn, user, isAdmin } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  // Mode: 'super' (Email/Pass) or 'manager' (PIN)
  const [mode, setMode] = useState<'super' | 'manager'>(tenant && tenant.slug !== 'official' ? 'manager' : 'super');

  useEffect(() => {
    if (tenant && tenant.slug !== 'official') {
      setMode('manager');
    } else {
      setMode('super');
    }
  }, [tenant]);

  // CHECK: If already admin, go straight to dashboard
  useEffect(() => {
    if (user && isAdmin && !isLoading) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !pin) return;
    setIsLoading(true);

    try {
      // 1. Verify PIN via RPC
      // @ts-ignore
      const { data: isValid, error } = await supabase.rpc('verify_tenant_pin', {
        t_slug: tenant.slug,
        pin_attempt: pin
      });

      if (error) throw error;

      if (isValid) {
        // 2. Set Local Session (The "Silent Login")
        // Since we rely on RLS allowing Public Writes for Matches (per our simplified plan),
        // we just need a frontend flag to say "I am the manager".
        const sessionData = {
          tenant_id: tenant.id,
          slug: tenant.slug,
          role: 'manager',
          timestamp: Date.now()
        };
        localStorage.setItem('palpite_manager_auth', JSON.stringify(sessionData));

        toast({ title: "Bem-vindo!", description: `Gestor da ${tenant.name}` });
        navigate("/admin", { replace: true });
      } else {
        toast({ title: "Acesso Negado", description: "PIN incorreto.", variant: "destructive" });
      }

    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro", description: "Falha na verificação.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    const result = await signIn(email, password, false);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Falha de Acesso",
        description: "Credenciais inválidas.",
        variant: "destructive"
      });
    } else {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#1d244a]/5"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 z-10 bg-white">
        <CardHeader className="space-y-1 bg-[#1d244a] text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4 mt-2">
            {mode === 'manager' && tenant?.branding?.logo_url ? (
              <img src={tenant.branding.logo_url} className="h-16 object-contain bg-white rounded p-1" />
            ) : (
              <Shield className="h-10 w-10 text-[#d19563]" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {mode === 'manager' ? `Gestão: ${tenant?.name}` : "Super Administrador"}
          </CardTitle>
          <CardDescription className="text-blue-200 text-center">
            {mode === 'manager' ? "Digite seu PIN de segurança" : "Acesso Mestre do Sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8 px-8 space-y-6">

          {mode === 'manager' ? (
            /* MANAGER PIN FORM */
            <form onSubmit={handleManagerLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> PIN de Acesso (4-6 dígitos)
                </label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={8}
                  placeholder="• • • •"
                  className="text-center text-3xl tracking-[1em] font-bold h-16 border-2 focus:border-[#d19563] text-[#1d244a]"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-[#d19563] hover:bg-[#b58053] text-white text-lg font-bold shadow-lg transform transition active:scale-95" disabled={isLoading}>
                {isLoading ? "Verificando..." : "ACESSAR PAINEL"}
              </Button>
            </form>
          ) : (
            /* SUPER ADMIN FORM */
            <form onSubmit={handleSuperLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sistema.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#1d244a] text-white" disabled={isLoading}>
                {isLoading ? "Autenticando..." : "Entrar como Super Admin"}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t text-center">
            {mode === 'manager' ? (
              <button onClick={() => setMode('super')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Sou Super Admin (Acesso Mestre)
              </button>
            ) : (
              tenant && tenant.slug !== 'official' && (
                <button onClick={() => setMode('manager')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Voltar para Login de Gestor
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
