import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Globe, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    branding: any;
    created_at: string;
}

const SuperAdmin = () => {
    const { user, isAdmin } = useAuth(); // We might need a stricter check later (isSuperAdmin)
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTenantName, setNewTenantName] = useState("");
    const [newTenantSlug, setNewTenantSlug] = useState("");

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("tenants" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTenants((data as any) || []);
        } catch (error) {
            console.error("Error fetching tenants:", error);
            toast.error("Erro ao carregar tenants.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTenantName || !newTenantSlug) return;

        try {
            const { data, error } = await supabase
                .from("tenants" as any)
                .insert([
                    {
                        name: newTenantName,
                        slug: newTenantSlug.toLowerCase().replace(/\s+/g, '-'),
                        branding: {
                            primary_color: "#1d244a",
                            site_title: newTenantName
                        }
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setTenants([data as any, ...tenants]);
            setNewTenantName("");
            setNewTenantSlug("");
            toast.success("Rádio criada com sucesso!");
        } catch (error) {
            console.error("Error creating tenant:", error);
            toast.error("Erro ao criar rádio. Slug já existe?");
        }
    };

    // Warning: Quick Security Check (ideally enforce via RLS or specific email check)
    // For now, if they can access the route, checking local Auth state is a basic UI guard
    if (!user) return <div className="p-8">Acesso Negado. Faça login.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1d244a]">Super Admin (SaaS)</h1>
                        <p className="text-gray-500">Gerencie todas as rádios e clientes da plataforma</p>
                    </div>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Voltar ao Site
                    </Button>
                </header>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* CREATE NEW TENANT */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Nova Rádio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleCreateTenant} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nome da Rádio/Empresa</label>
                                    <Input
                                        placeholder="Ex: Rádio Mix FM"
                                        value={newTenantName}
                                        onChange={e => setNewTenantName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Slug (Link)</label>
                                    <Input
                                        placeholder="ex: radiomix"
                                        value={newTenantSlug}
                                        onChange={e => setNewTenantSlug(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        O link será: {newTenantSlug || 'slug'}.palpitepremiado.com
                                    </p>
                                </div>
                                <Button type="submit" className="w-full bg-[#1d244a] hover:bg-[#2a3459]">
                                    Criar Rádio
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* TENANTS LIST */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-[#1d244a]" /> Rádios Ativas ({tenants.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Link (Slug)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Criado em</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map(tenant => (
                                            <TableRow key={tenant.id}>
                                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                                <TableCell>
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                        {tenant.slug}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {tenant.status.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-500">
                                                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost">Gerenciar</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default SuperAdmin;
