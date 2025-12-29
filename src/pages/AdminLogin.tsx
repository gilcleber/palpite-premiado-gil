import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isFirstAccess } = useAuth();
  const navigate = useNavigate();
  const VERSION = "v3.0 (Rescue Fixed)";
  const isSetupMode = window.location.href.includes('setup=true');

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

      // Race condition to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );

      const result: any = await Promise.race([
        signIn(email, password),
        timeoutPromise
      ]);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo",
      });

      // Navegar imediatamente
      navigate("/admin", { replace: true });

    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Ocorreu um erro durante o login";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado";
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
            {isFirstAccess
              ? "Primeiro acesso - configure suas credenciais de admin"
              : "Acesso restrito - Faça login para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          {isSetupMode && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Modo de Resgate Ativado</p>
              <p>Criação de admin forçada.</p>
            </div>
          )}
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
              {isLoading ? "Processando..." : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isFirstAccess ? "Criar Admin e Entrar" : "Acessar Painel"}
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
          <p className="text-center text-xs text-gray-400 mt-4">{VERSION}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
