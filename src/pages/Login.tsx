
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isFirstAccess } = useAuth();
  const navigate = useNavigate();

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
      
      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: isFirstAccess ? "Admin criado com sucesso" : "Login realizado",
        description: isFirstAccess 
          ? "Primeiro admin criado com sucesso" 
          : "Bem-vindo de volta!",
      });
      
      navigate("/admin");
      
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            Área Administrativa
          </CardTitle>
          <CardDescription className="text-blue-100 text-center">
            {isFirstAccess 
              ? "Primeiro acesso - configure suas credenciais de admin"
              : "Faça login para acessar o painel de controle"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-blue-800">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Digite seu email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-blue-800">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Digite sua senha"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isFirstAccess ? "Criar Admin e Entrar" : "Entrar"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
