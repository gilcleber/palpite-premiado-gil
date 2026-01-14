import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

const SuperAdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                toast.success("Login realizado com sucesso!");
                navigate("/admin/super");
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d244a] via-[#2a3459] to-[#1d244a] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-2 border-[#d19563]/30 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d19563] to-[#b8804f] rounded-full flex items-center justify-center shadow-lg">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-[#1d244a]">
                        Super Admin
                    </CardTitle>
                    <CardDescription>
                        Acesso exclusivo para administradores do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Senha</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#1d244a] hover:bg-[#2a3459] text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminLogin;
