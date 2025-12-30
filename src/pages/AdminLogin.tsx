import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Carregando...");
  const [showPassword, setShowPassword] = useState(false);

  // RECONNECTED Global Auth State
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const VERSION = "v5.0 (Final Integration)";
  const isSetupMode = window.location.href.includes('setup=true');

  // CHECK: If already admin, go straight to dashboard
  useEffect(() => {
    if (user && isAdmin && !isLoading) {
      console.log("Already admin, redirecting...", { user: user.email, isAdmin });
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Quick Health Check on Mount
  useEffect(() => {
    console.log(`🏥 AdminLogin ${VERSION} Mounted`);
    supabase.from('app_settings').select('count', { count: 'exact', head: true })
      .then(() => console.log("✅ DB Ping OK"))
      .catch(err => console.warn("⚠️ DB Ping Fail:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);

      // 1. Connectivity Test
      setStatusText("Testando conexão...");
      const pingStart = Date.now();
      const { error: pingError } = await supabase.from('admin_users').select('count', { count: 'exact', head: true });
      console.log(`📡 Ping took ${Date.now() - pingStart}ms`);

      if (pingError) console.warn("Ping Warning:", pingError);

      // 2. Global Login (Triggering Master Bypass if needed)
      setStatusText("Autenticando...");
      console.log("🔑 Authenticating via Global Hook...");

      // Use the hook's signIn which handles everything
      const result = await signIn(email, password, isSetupMode);

      if (result.error) {
        throw result.error;
      }

      setStatusText("Entrando...");
      console.log("✅ Login Success!");
      toast({ title: "Bem-vindo!", description: "Acesso autorizado." });

      // 3. Navigation
      // The useEffect above will likely catch the state change first, 
      // but we force navigation here just in case.
      navigate("/admin", { replace: true });

    } catch (error: any) {
      console.error("Login Fatal:", error);
      let msg = error.message;
      if (msg?.includes("Invalid login")) msg = "Senha ou email incorretos";

      toast({
        title: "Falha de Acesso",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setStatusText("Entrar");
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
            Acesso Restrito
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#1d244a]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-gray-300"
                placeholder="admin@exemplo.com"
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
                  className="pr-10 border-gray-300"
                  placeholder="******"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
              {isLoading ? statusText : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-[#1d244a] border-[#1d244a] hover:bg-[#1d244a] hover:text-white"
            >
              Voltar ao Site
            </Button>
          </div>

          <div className="mt-4 text-center text-[10px] text-gray-300 opacity-50 hover:opacity-100 transition-opacity">
            <p>{VERSION}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
