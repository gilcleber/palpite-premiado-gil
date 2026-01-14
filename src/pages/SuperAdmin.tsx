import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Globe, BarChart3, Users, DollarSign, Settings, Palette, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Branding {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    banner_url: string;
    site_title: string;
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    branding: Branding;
    created_at: string;
}

const SuperAdmin = () => {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [newTenantName, setNewTenantName] = useState("");
    const [newTenantSlug, setNewTenantSlug] = useState("");

    // Edit State
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [editForm, setEditForm] = useState<Partial<Tenant> & { branding: Partial<Branding> }>({ branding: {} });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Stats
    const stats = {
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.status === 'active').length,
        totalRevenue: tenants.length * 99.90, // MOCK: Assume R$ 99,90 plan
    };

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
            if (error) throw error;

            // Sanitize data (Defensive Programming)
            const safeTenants = (data || []).map((t: any) => ({
                ...t,
                branding: t.branding || {}
            }));

            setTenants(safeTenants as Tenant[]);
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
                            secondary_color: "#ffffff",
                            site_title: newTenantName,
                            logo_url: "",
                            banner_url: ""
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

    const handleUpdateTenant = async () => {
        if (!editingTenant) return;

        try {
            const { error } = await supabase
                .from('tenants' as any)
                .update({
                    name: editForm.name,
                    slug: editForm.slug,
                    status: editForm.status,
                    branding: editForm.branding
                })
                .eq('id', editingTenant.id);

            if (error) throw error;

            setTenants(tenants.map(t => t.id === editingTenant.id ? { ...t, ...editForm } as Tenant : t));
            setIsSheetOpen(false);
            toast.success("Tenant atualizado com sucesso!");
        } catch (error) {
            console.error("Error updating tenant:", error);
            toast.error("Erro ao atualizar tenant.");
        }
    };

    const openEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setEditForm({
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            branding: { ...tenant.branding }
        });
        setIsSheetOpen(true);
    };

    if (!user) return <div className="p-8">Acesso Negado. Faça login.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 space-y-8">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1d244a] flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8" /> Super Admin
                    </h1>
                    <p className="text-gray-500">Painel de Controle Mestre (God Mode)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Ir para Rádio Oficial
                    </Button>
                </div>
            </header>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Rádios</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTenants}</div>
                        <p className="text-xs text-muted-foreground">+2 novos essa semana (Simulado)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rádios Ativas</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTenants}</div>
                        <p className="text-xs text-muted-foreground">1 bloqueada / suspensa</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Estimada (Planos de R$ 99,90)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* CREATE NEW TENANT */}
                <Card className="md:col-span-1 h-fit border-[#1d244a] border-t-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Nova Rádio
                        </CardTitle>
                        <CardDescription>Crie um novo ambiente isolado.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleCreateTenant} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome da Rádio/Empresa</Label>
                                <Input
                                    placeholder="Ex: Rádio Mix FM"
                                    value={newTenantName}
                                    onChange={e => setNewTenantName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (Subdomínio)</Label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        https://
                                    </span>
                                    <Input
                                        className="rounded-l-none"
                                        placeholder="radiomix"
                                        value={newTenantSlug}
                                        onChange={e => setNewTenantSlug(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Final: {newTenantSlug || 'radio'}.palpitepremiado.com
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
                            <Users className="w-5 h-5 text-[#1d244a]" /> Gerenciar Rádios
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
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map(tenant => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                                                        {tenant.branding?.logo_url ? <img src={tenant.branding.logo_url} className="w-full h-full object-cover" /> : <Globe className="w-4 h-4 text-gray-300" />}
                                                    </div>
                                                    {tenant.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600">
                                                    /{tenant.slug}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tenant.status.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => openEdit(tenant)}>
                                                    <Settings className="w-3 h-3 mr-1" /> Gerenciar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* EDIT TENANT SHEET */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Gerenciar Rádio</SheetTitle>
                        <SheetDescription>
                            Edite as informações e a aparência da rádio {editingTenant?.name}.
                        </SheetDescription>
                    </SheetHeader>

                    {editingTenant && (
                        <div className="space-y-6 py-6">

                            {/* BASIC INFO */}
                            <div className="space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Configurações Básicas
                                </h3>
                                <div className="grid gap-2">
                                    <Label>Nome da Rádio</Label>
                                    <Input
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Slug (Proibido alterar em prod)</Label>
                                    <Input
                                        value={editForm.slug}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editForm.status}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                        <option value="active">Ativo (Pagamento em Dia)</option>
                                        <option value="suspended">Suspenso (Bloqueado)</option>
                                        <option value="archived">Arquivado</option>
                                    </select>
                                </div>
                            </div>

                            {/* BRANDING */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Personalização (White-Label)
                                </h3>

                                <div className="grid gap-2">
                                    <Label>Título do Site</Label>
                                    <Input
                                        value={editForm.branding?.site_title || ''}
                                        onChange={e => setEditForm({
                                            ...editForm,
                                            branding: { ...editForm.branding, site_title: e.target.value }
                                        })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Cor Primária</Label>
                                        <div className="flex gap-2">
                                            <div
                                                className="w-10 h-10 rounded border shadow-sm"
                                                style={{ backgroundColor: editForm.branding?.primary_color || '#1d244a' }}
                                            />
                                            <Input
                                                value={editForm.branding?.primary_color || ''}
                                                onChange={e => setEditForm({
                                                    ...editForm,
                                                    branding: { ...editForm.branding, primary_color: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cor Secundária</Label>
                                        <div className="flex gap-2">
                                            <div
                                                className="w-10 h-10 rounded border shadow-sm"
                                                style={{ backgroundColor: editForm.branding?.secondary_color || '#ffffff' }}
                                            />
                                            <Input
                                                value={editForm.branding?.secondary_color || ''}
                                                onChange={e => setEditForm({
                                                    ...editForm,
                                                    branding: { ...editForm.branding, secondary_color: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>URL do Logo</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={editForm.branding?.logo_url || ''}
                                        onChange={e => setEditForm({
                                            ...editForm,
                                            branding: { ...editForm.branding, logo_url: e.target.value }
                                        })}
                                    />
                                    {editForm.branding?.logo_url && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Preview: <img src={editForm.branding.logo_url} className="h-8 inline ml-2" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>URL do Banner (Topo)</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={editForm.branding?.banner_url || ''}
                                        onChange={e => setEditForm({
                                            ...editForm,
                                            branding: { ...editForm.branding, banner_url: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <SheetFooter>
                                <Button onClick={handleUpdateTenant} className="w-full bg-[#1d244a]">
                                    Salvar Alterações
                                </Button>
                            </SheetFooter>

                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default SuperAdmin;
