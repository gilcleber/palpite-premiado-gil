import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Radio, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [slug, setSlug] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug || !pin) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o ID da Rádio e o PIN",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // 1. Verify PIN via RPC
      // @ts-ignore
      const { data: isValid, error } = await supabase.rpc('verify_tenant_pin', {
        t_slug: slug.toLowerCase(),
        pin_attempt: pin
      });

      if (error) throw error;

      if (isValid) {
        // 2. Fetch basic tenant info for session
        const { data: tenant, error: tError } = await supabase
          .from('tenants')
          .select('id, name, slug, branding')
          .eq('slug', slug.toLowerCase())
          .single();

        if (tError || !tenant) throw new Error("Erro ao carregar dados da rádio");

        // 3. Set Local Session
        const sessionData = {
          tenant_id: tenant.id,
          slug: tenant.slug,
          role: 'manager',
          timestamp: Date.now(),
          pin: pin
        };
        localStorage.setItem('palpite_manager_auth', JSON.stringify(sessionData));

        toast({
          title: "Acesso Permitido",
          description: `Bem-vindo à gestão da ${tenant.name}`
        });

        // Force reload/redirect to ensure TenantContext picks up the new status/slug if needed
        // But simple navigate usually works if Admin component checks localStorage
        navigate("/admin");
      } else {
        toast({
          title: "Acesso Negado",
          description: "ID da Rádio ou PIN incorretos.",
          variant: "destructive",
        });
        setPin(""); // Clear pin on error
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro no sistema",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

      <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-[#1e293b]/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-white/5">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Área do Assinante
          </CardTitle>
          <CardDescription className="text-slate-400">
            Acesse o painel da sua rádio usando o PIN
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                ID da Rádio (Slug)
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/\s/g, ''))} // No spaces
                disabled={isLoading}
                className="bg-[#0f172a] border-white/10 text-white focus:ring-purple-500/50 h-12"
                placeholder="ex: educadora"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                PIN de Acesso
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={isLoading}
                maxLength={6}
                className="bg-[#0f172a] border-white/10 text-white focus:ring-purple-500/50 h-12 text-center text-xl tracking-widest font-mono"
                placeholder="• • • •"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg font-medium shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</>
              ) : (
                <>Acessar Painel <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
