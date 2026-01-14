import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ChangePinModalProps {
    tenantSlug: string;
    currentPin: string; // Should be passed if known, or we assume they know it
    onSuccess: () => void;
}

const ChangePinModal = ({ tenantSlug, currentPin, onSuccess }: ChangePinModalProps) => {
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (newPin !== confirmPin) {
            toast({ title: "Erro", description: "Os PINs não coincidem.", variant: "destructive" });
            return;
        }
        if (newPin.length < 4) {
            toast({ title: "Erro", description: "O PIN deve ter pelo menos 4 dígitos.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // @ts-ignore
            const { data, error } = await supabase.rpc('update_manager_pin', {
                t_slug: tenantSlug,
                old_pin: currentPin,
                new_pin: newPin
            });

            if (error) throw error;

            if (data === true) {
                toast({ title: "Sucesso!", description: "PIN atualizado com segurança." });
                onSuccess();
            } else {
                toast({ title: "Falha", description: "Não foi possível atualizar o PIN.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao atualizar PIN.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                    <CardTitle>Alteração Obrigatória de PIN</CardTitle>
                    <CardDescription className="text-orange-100">
                        Por segurança, você deve alterar o PIN padrão (1234).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Novo PIN</label>
                        <Input
                            type="password"
                            placeholder="Novo PIN Secreto"
                            value={newPin}
                            onChange={e => setNewPin(e.target.value)}
                            maxLength={8}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmar PIN</label>
                        <Input
                            type="password"
                            placeholder="Repita o PIN"
                            value={confirmPin}
                            onChange={e => setConfirmPin(e.target.value)}
                            maxLength={8}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                    <Button
                        onClick={handleUpdate}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Salvando..." : "Atualizar PIN & Acessar"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePinModal;
