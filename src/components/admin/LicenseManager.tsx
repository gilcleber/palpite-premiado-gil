import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, Ban, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    owner_email: string;
    status: 'active' | 'inactive' | 'suspended';
    valid_until: string | null;
}

const LicenseManager = () => {
    const { role } = useAuth();
    const { toast } = useToast();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    // New Tenant Form
    const [isCreating, setIsCreating] = useState(false);
    const [newTenant, setNewTenant] = useState({ name: "", slug: "", owner_email: "", valid_until: "" });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("tenants")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTenants(data as any || []);
        } catch (error) {
            console.error("Error fetching tenants:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async () => {
        if (!newTenant.name || !newTenant.slug || !newTenant.owner_email) {
            toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
            return;
        }

        try {
            setIsCreating(true);

            // 1. Create Tenant
            const { data: tenantData, error: tenantError } = await supabase
                .from("tenants")
                .insert([{
                    name: newTenant.name,
                    slug: newTenant.slug,
                    owner_email: newTenant.owner_email,
                    valid_until: newTenant.valid_until ? new Date(newTenant.valid_until).toISOString() : null,
                    status: 'active'
                }])
                .select()
                .single();

            if (tenantError) throw tenantError;

            // 2. Ideally, we would create an admin_profile for this owner here, 
            // but we need their User ID (auth.users). 
            // Since we can't create Auth Users from client-side easily without an Edge Function,
            // we will just create the Tenant for now. The owner will need to Sign Up, and then we link them manually or via invite logic.
            // FOR NOW: Display success message.

            toast({ title: "Sucesso!", description: "Licença criada. Agora o usuário deve se cadastrar." });
            setNewTenant({ name: "", slug: "", owner_email: "", valid_until: "" });
            fetchTenants();

        } catch (error: any) {
            toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from("tenants").update({ status: newStatus }).eq("id", id);
            if (error) throw error;
            toast({ title: "Alterado", description: `Status mudou para ${newStatus}` });
            fetchTenants();
        } catch (error) {
            toast({ title: "Erro", variant: "destructive" });
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza? Isso apagará todos os dados dessa rádio!")) return;
        try {
            const { error } = await supabase.from("tenants").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Removido", description: "Licença excluída." });
            fetchTenants();
        } catch (error) {
            toast({ title: "Erro ao deletar", description: "Talvez existam dados vinculados (palpites).", variant: "destructive" });
        }
    }

    if (role !== 'super_admin') {
        return <div className="p-8 text-center text-red-500">Acesso Negado (Apenas Super Admin)</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in p-1">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                <CardHeader className="bg-[#1d244a] text-white rounded-t-lg flex flex-row justify-between items-center">
                    <CardTitle>Administração de Licenças (SaaS)</CardTitle>
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">Super Admin</Badge>
                </CardHeader>
                <CardContent className="p-6">

                    {/* Create Form */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
                        <Input
                            placeholder="Nome da Rádio"
                            value={newTenant.name}
                            onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                        />
                        <Input
                            placeholder="Slug (ex: radio-band)"
                            value={newTenant.slug}
                            onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })}
                        />
                        <Input
                            placeholder="Email do Dono"
                            value={newTenant.owner_email}
                            onChange={e => setNewTenant({ ...newTenant, owner_email: e.target.value })}
                        />
                        <Input
                            type="date"
                            value={newTenant.valid_until}
                            onChange={e => setNewTenant({ ...newTenant, valid_until: e.target.value })}
                        />
                        <Button onClick={handleCreateTenant} disabled={isCreating} className="bg-green-600 hover:bg-green-700">
                            {isCreating ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Criar Licença
                        </Button>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="text-center py-8"><Loader2 className="animate-spin mx-auto h-8 w-8 text-[#1d244a]" /></div>
                    ) : (
                        <div className="space-y-4">
                            {tenants.map(tenant => (
                                <div key={tenant.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-bold text-lg text-[#1d244a]">{tenant.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {tenant.slug} | Dono: {tenant.owner_email}</p>
                                        <div className="flex gap-2 text-xs">
                                            <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                                                {tenant.status === 'active' ? 'Ativo' : 'Inativo/Suspenso'}
                                            </Badge>
                                            <span className="flex items-center text-gray-600">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Validade: {tenant.valid_until ? new Date(tenant.valid_until).toLocaleDateString() : 'Ilimitado'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        {tenant.status === 'active' ? (
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(tenant.id, 'suspended')}>
                                                <Ban className="h-4 w-4 mr-2" /> Bloquear
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(tenant.id, 'active')}>
                                                <CheckCircle className="h-4 w-4 mr-2" /> Ativar
                                            </Button>
                                        )}
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(tenant.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {tenants.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma licença criada.</p>}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default LicenseManager;
