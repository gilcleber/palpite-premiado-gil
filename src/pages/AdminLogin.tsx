import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import DebugNetwork from "@/components/DebugNetwork";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isFirstAccess, user, isAdmin } = useAuth(); // Destructure user and isAdmin
  const navigate = useNavigate();
  const VERSION = "v4.2 (Actual Fix)";
  const isSetupMode = window.location.href.includes('setup=true');

  // CHECK: If already admin, go straight to dashboard
  useEffect(() => {
    if (user && isAdmin && !isLoading) {
      console.log("Already admin, redirecting...");
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // AUTO-RESTORE LOGIC (Priority Fix)
  // If user is logged in but not admin, it means data is missing.
  // We force-insert the user into admin_users to fix the "Zombie" state.
  useEffect(() => {
    const restoreAdmin = async () => {
      if (user && !isAdmin && !isLoading) {
        console.log("⚠️ Zombie Admin detected. Attempting auto-restoration...");
        const { error } = await supabase.from('admin_users').insert({
          id: user.id,
          email: user.email
        });

        if (!error) {
          toast({ title: "Acesso Restaurado!", description: "Recarregando..." });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          console.error("Auto-restore failed:", error);
          // If restore fails multiple times, maybe force logout?
        }
      }
    };

    restoreAdmin();
  }, [user, isAdmin, isLoading, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // NUCLEAR OPTION: The user says it only works if they click "Clear Cache".
      // So we will DO EXACTLY THAT automatically.

      // 1. Preserve critical flags if needed (none really, we want fresh)
      // 2. Wipe everything
      console.log("🧹 Executing Nuclear Cleanup...");
      localStorage.clear();
      sessionStorage.clear();

      // 3. Restore App Version to prevent reload-loop on next F5
      // (We hardcode the string or just let App handle it once)
      localStorage.setItem('app_version', '3.26-auto-clean'); // Keep compatible with App.tsx

      // 4. Force Supabase out (just in case)
      await supabase.auth.signOut();

      // Race condition to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );

      const result: any = await Promise.race([
        signIn(email, password, isSetupMode), // Pass setup mode to force creation
        timeoutPromise
      ]);
      // ... existing code ...
      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo",
      });

      // Navegar imediatamente para o painel limpo (sem query params)
      navigate("/admin", { replace: true });
      // Forçar limpeza da URL history caso o navigate não seja suficiente
      window.history.replaceState({}, document.title, "/palpite-premiado-gil/admin");

    } catch (error: any) {
      // ... existing catch block ...
      console.error("Login error:", error);
      let errorMessage = "Ocorreu um erro durante o login";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado";
      } else {
        // Show raw error for debugging
        errorMessage = `Erro: ${error.message || "Desconhecido"}`;
      }

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] via-[#2a3459] to-[#1d244a] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 bg-[#1d244a] text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-[#d19563]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Área Administrativa
          </CardTitle>
          <CardDescription className="text-blue-100 text-center">
            Acesso restrito - Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#1d244a]">
                Email do Administrador
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
                placeholder="Digite seu email administrativo"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#1d244a]">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10 border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1d244a]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1d244a] hover:bg-[#2a3459] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Acessar Painel
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="text-[10px] text-gray-300 hover:text-red-400 opacity-50 transition-colors"
            >
              Resetar Sistema
            </button>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-[#1d244a] border-[#1d244a] hover:bg-[#1d244a] hover:text-white"
            >
              Voltar ao Site
            </Button>
          </div>

          {/* Subtle Version/Debug Info (Hidden unless needed) */}
          <div className="mt-4 text-center text-[10px] text-gray-300 opacity-50 hover:opacity-100 transition-opacity">
            <p>{VERSION}</p>
          </div>
        </CardContent>
      </Card>
      {/* Hidden Debug Network unless strictly needed */}
      {/* <DebugNetwork /> */}
    </div>
  );
};


export default AdminLogin;
