import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Globe, BarChart3, Users, DollarSign, Pencil, Settings, Palette, ShieldAlert, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, ExternalLink, Crown, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TeamApprovalQueue from "@/components/admin/TeamApprovalQueue";

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
    subscription_price: number;
    manager_pin: string | null;
    expires_at: string | null;
}

interface FinancialTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    created_at: string;
}

const SuperAdmin = () => {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Tenant State
    const [newTenantName, setNewTenantName] = useState("");
    const [newTenantSlug, setNewTenantSlug] = useState("");

    // Edit Tenant State
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [editForm, setEditForm] = useState<Partial<Tenant> & { branding: Partial<Branding> }>({ branding: {} });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Finance State
    const [newTransDesc, setNewTransDesc] = useState("");
    const [newTransAmount, setNewTransAmount] = useState("");
    const [newTransType, setNewTransType] = useState<'income' | 'expense'>('expense');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Tenants
            const { data: tenantsData, error: tenantsError } = await supabase
                .from("tenants" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (tenantsError) throw tenantsError;

            // Fetch Financials
            const { data: financeData, error: financeError } = await supabase
                .from("saas_financials" as any)
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (financeError) throw financeError;

            // Sanitize Tenant Data
            const safeTenants = (tenantsData || []).map((t: any) => ({
                ...t,
                branding: t.branding || {},
                subscription_price: t.subscription_price || 0
            }));

            setTenants(safeTenants as unknown as Tenant[]);
            setTransactions(financeData as unknown as FinancialTransaction[] || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Erro ao carregar dados do painel.");
        } finally {
            setLoading(false);
        }
    };

    // --- TENANT ACTIONS ---

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
                        status: 'active',
                        subscription_price: 99.90, // Default price
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

            const safeData = data as any;
            const safeNewTenant = {
                ...safeData,
                branding: safeData.branding || {},
                subscription_price: safeData.subscription_price || 99.90
            };
            setTenants([safeNewTenant as any, ...tenants]);

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
                    subscription_price: editForm.subscription_price,
                    branding: editForm.branding,
                    manager_pin: editForm.manager_pin
                })
                .eq('id', editingTenant.id);

            if (error) throw error;

            setTenants(tenants.map(t => t.id === editingTenant.id ? { ...t, ...editForm } as Tenant : t));
            setIsSheetOpen(false);
            toast.success("Dados atualizados com sucesso!");
        } catch (error) {
            console.error("Error updating tenant:", error);
            toast.error("Erro ao atualizar tenant.");
        }
    };

    // --- FINANCE ACTIONS ---

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTransDesc || !newTransAmount) return;

        try {
            const amount = parseFloat(newTransAmount);
            const { data, error } = await supabase
                .from("saas_financials" as any)
                .insert([{
                    description: newTransDesc,
                    amount: amount,
                    type: newTransType
                }])
                .select()
                .single();

            if (error) throw error;

            setTransactions([data as any, ...transactions]);
            setNewTransDesc("");
            setNewTransAmount("");
            toast.success("Lançamento adicionado!");
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast.error("Erro ao adicionar lançamento.");
        }
    };

    const handleEditTransaction = async (transaction: FinancialTransaction) => {
        // Populate form with transaction data for editing
        setNewTransDesc(transaction.description);
        setNewTransAmount(transaction.amount.toString());
        setNewTransType(transaction.type);
        // Silently delete the old one (no confirmation needed for edit)
        try {
            await supabase
                .from("saas_financials" as any)
                .delete()
                .eq("id", transaction.id);
            setTransactions(transactions.filter(t => t.id !== transaction.id));
        } catch (error) {
            console.error("Error removing old transaction:", error);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;

        try {
            const { error } = await supabase
                .from("saas_financials" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;

            setTransactions(transactions.filter(t => t.id !== id));
            toast.success("Lançamento excluído!");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast.error("Erro ao excluir lançamento.");
        }
    };

    // --- HELPERS ---

    const openEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setEditForm({
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            subscription_price: tenant.subscription_price,
            branding: { ...tenant.branding },
            manager_pin: tenant.manager_pin
        });
        setIsSheetOpen(true);
    };

    const getTenantUrl = (slug: string) => {
        return `${window.location.origin}/${slug}`;
    };

    // --- CALCULATIONS ---

    const officialTenant = tenants.find(t => t.slug === 'official');
    const clientTenants = tenants.filter(t => t.slug !== 'official');

    const activeCount = tenants.filter(t => t.status === 'active' && t.slug !== 'official').length;
    const suspendedCount = tenants.filter(t => t.status !== 'active' && t.slug !== 'official').length;

    // Revenue from Subscriptions (MRR)
    const mrr = tenants
        .filter(t => t.status === 'active' && t.slug !== 'official')
        .reduce((sum, t) => sum + (Number(t.subscription_price) || 0), 0);

    // Extra Income/Expenses (Using simulated logic matching Finance section)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalExtraIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const operationalProfit = mrr + totalExtraIncome - totalExpenses;

    if (!user) return <div className="p-8">Acesso Negado. Faça login.</div>;

    return (
        <div className="min-h-screen bg-[#0b1121] p-8 space-y-8">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-blue-400" /> Super Admin
                    </h1>
                    <p className="text-slate-400">Gestão Global da Plataforma</p>
                </div>
                <div className="flex gap-2">
                    {officialTenant && (
                        <Button
                            className="bg-[#1d244a] hover:bg-[#2a3459]"
                            onClick={() => window.open(getTenantUrl(officialTenant.slug), '_blank')}
                        >
                            <Globe className="w-4 h-4 mr-2" /> Acessar Rádio Oficial
                        </Button>
                    )}
                </div>
            </header>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-white/5 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Clientes Totais</CardTitle>
                        <Globe className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clientTenants.length}</div>
                        <p className="text-xs text-slate-500">Rádios na plataforma</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Faturamento (MRR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">R$ {mrr.toFixed(2)}</div>
                        <p className="text-xs text-slate-500">Mensal Recorrente</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Despesas Extras</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">R$ {totalExpenses.toFixed(2)}</div>
                        <p className="text-xs text-slate-500">Últimos lançamentos</p>
                    </CardContent>
                </Card>
                <Card className={`bg-slate-900 border shadow-lg ${operationalProfit >= 0 ? "border-green-500/20" : "border-red-500/20"}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Lucro Operacional</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${operationalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            R$ {operationalProfit.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500">Considerando MRR e Extras</p>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
            <div className="grid md:grid-cols-4 gap-6">

                {/* LEFT COLUMN: OFFICIAL RADIO + CREATE FORM */}
                <div className="space-y-6 md:col-span-1">
                    {/* OFFICIAL RADIO HIGHLIGHT */}
                    {officialTenant && (
                        <Card className="md:col-span-1 bg-gradient-to-br from-[#1d244a] via-[#1e293b] to-[#0f172a] text-white border-2 border-[#d19563]/50 shadow-2xl overflow-hidden relative group h-fit">
                            {/* Decorative Glow */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#d19563]/10 rounded-full blur-[80px] group-hover:bg-[#d19563]/20 transition-all duration-1000"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>

                            <CardHeader className="relative z-10 pb-4 border-b border-white/5">
                                <CardTitle className="text-xl flex items-center gap-2 text-[#d19563] font-bold tracking-tight">
                                    <Crown className="w-6 h-6 fill-current drop-shadow-lg" /> Rádio Mestre
                                </CardTitle>
                                <CardDescription className="text-blue-200/70 text-xs font-mono tracking-wider uppercase">
                                    Matriz do Sistema • v5.0
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10 pt-6">
                                {officialTenant ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <div className="bg-gradient-to-br from-white to-gray-300 p-[2px] rounded-full shrink-0 shadow-lg">
                                                <div className="bg-white rounded-full p-1 w-12 h-12 flex items-center justify-center overflow-hidden">
                                                    {officialTenant.branding?.logo_url ? (
                                                        <img src={officialTenant.branding.logo_url} className="w-full h-full object-contain" />
                                                    ) : <Globe className="text-[#1d244a] w-6 h-6" />}
                                                </div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold truncate text-base text-white">{officialTenant.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d19563] text-white">OFICIAL</span>
                                                    <p className="text-xs text-blue-300 truncate font-mono">/{officialTenant.slug}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="default"
                                                className="w-full bg-[#d19563] hover:bg-[#b58053] text-white border-0 shadow-lg shadow-[#d19563]/20 font-bold"
                                                onClick={() => window.open(`/${officialTenant.slug}`, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" /> Acessar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full border-white/20 hover:bg-white/10 text-white hover:text-white"
                                                onClick={() => openEdit(officialTenant)}
                                            >
                                                <Settings className="w-4 h-4 mr-2" /> Configurar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                                        <span className="text-xs uppercase tracking-widest">Carregando Matriz...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* NEW RADIO FORM */}
                    <Card className="bg-slate-900 border-white/5 border-t-purple-500 border-t-4 text-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Plus className="w-5 h-5 text-purple-400" /> Nova Rádio Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleCreateTenant} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Nome Fantasia</Label>
                                    <Input
                                        placeholder="Ex: Rádio Mix FM"
                                        value={newTenantName}
                                        onChange={e => setNewTenantName(e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Slug (Link)</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                                            /
                                        </span>
                                        <Input
                                            className="rounded-l-none bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                                            placeholder="radiomix"
                                            value={newTenantSlug}
                                            onChange={e => setNewTenantSlug(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Link: {window.location.host}/{newTenantSlug || '...'}
                                    </p>
                                </div>
                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                                    Criar Rádio
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: TENANT LIST */}
                <div className="md:col-span-3">
                    <Tabs defaultValue="active" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-slate-900 border border-white/5 shadow-sm p-1">
                                <TabsTrigger value="active" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">Ativos</TabsTrigger>
                                <TabsTrigger value="suspended" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-400">Suspensos</TabsTrigger>
                                <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">Cancelados</TabsTrigger>
                                <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">Todos</TabsTrigger>
                            </TabsList>
                            <span className="text-xs text-slate-500 font-medium">{tenants.length} rádios</span>
                        </div>

                        {['active', 'suspended', 'cancelled', 'all'].map((tab) => (
                            <TabsContent value={tab} key={tab} className="mt-0">
                                <Card className="border-blue-100 shadow-md">
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                    <TableHead className="pl-4">Rádio</TableHead>
                                                    <TableHead>Validade</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right pr-4">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tenants
                                                    .filter(t => t.slug !== 'official')
                                                    .filter(t => tab === 'all' ? true : t.status === tab)
                                                    .map((tenant) => (
                                                        <TableRow key={tenant.id}>
                                                            <TableCell className="pl-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                                                                        {tenant.branding?.logo_url ? (
                                                                            <img src={tenant.branding.logo_url} className="w-full h-full object-cover" />
                                                                        ) : <Globe className="w-5 h-5 text-gray-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm text-[#1d244a]">{tenant.name}</div>
                                                                        <div className="text-xs text-muted-foreground">/{tenant.slug}</div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {tenant.expires_at ? (
                                                                    <div className="flex items-center text-xs gap-1 font-medium text-gray-700">
                                                                        <Calendar className="w-3 h-3 text-gray-500" />
                                                                        {new Date(tenant.expires_at).toLocaleDateString('pt-BR')}
                                                                    </div>
                                                                ) : <span className="text-xs text-gray-400 italic">Vitalício</span>}
                                                            </TableCell>
                                                            <TableCell>
                                                                {tenant.status === 'active' && <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold border border-green-200">ATIVO</span>}
                                                                {tenant.status === 'suspended' && <span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700 font-bold border border-orange-200">SUSPENSO</span>}
                                                                {tenant.status === 'cancelled' && <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold border border-red-200">CANCELADO</span>}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-4">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(`${window.location.origin}/${tenant.slug}`, '_blank')}>
                                                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => openEdit(tenant)}>
                                                                        <Settings className="w-3 h-3 mr-1" /> Gerenciar
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                {tenants.filter(t => t.slug !== 'official' && (tab === 'all' ? true : t.status === tab)).length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                                                            Nenhuma rádio encontrada em '{tab === 'active' ? 'Ativos' : tab === 'suspended' ? 'Suspensos' : tab === 'cancelled' ? 'Cancelados' : 'Todos'}'.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/5 my-8"></div>

            {/* TEAM APPROVAL QUEUE SECTION */}
            <div>
                <TeamApprovalQueue />
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/5 my-8"></div>

            {/* FINANCE DASHBOARD (REDESIGNED) */}
            <div className="mt-8 rounded-3xl bg-[#0f172a] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-purple-400" /> Financeiro SaaS
                            </h2>
                            <p className="text-slate-400 text-sm">Visão geral de faturamento e despesas do sistema.</p>
                        </div>

                        {/* Add Transaction Button Trigger (could be a modal, but keeping inline for now) */}
                        <div className="flex gap-2">
                            {/* Placeholder for future actions */}
                        </div>
                    </div>

                    {/* FINANCE STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative group hover:border-purple-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-green-400" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-900/50 text-green-400 border border-green-500/20">+ Recorrente</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Faturamento (MRR)</p>
                                <h3 className="text-3xl font-bold text-white">R$ {mrr.toFixed(2)}</h3>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative group hover:border-red-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-900/50 text-red-400 border border-red-500/20">- Gastos</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Despesas Extras</p>
                                <h3 className="text-3xl font-bold text-white">R$ {totalExpenses.toFixed(2)}</h3>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1d244a] to-[#2a3459] border border-blue-500/30 relative overflow-hidden">
                            {/* Glow */}
                            <div className="absolute inset-0 bg-blue-500/10 blur-xl"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/50">
                                        <Wallet className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">Líquido</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Lucro Operacional</p>
                                    <h3 className="text-3xl font-bold text-white">R$ {operationalProfit.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* ADD TRANSACTION FORM */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-purple-400" /> Novo Lançamento
                                </h3>
                                <form onSubmit={handleAddTransaction} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400">Descrição</label>
                                        <Input
                                            placeholder="Ex: Servidor, Domínio, Venda Extra..."
                                            value={newTransDesc}
                                            onChange={e => setNewTransDesc(e.target.value)}
                                            className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400">Valor (R$)</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                value={newTransAmount}
                                                onChange={e => setNewTransAmount(e.target.value)}
                                                className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400">Tipo</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                value={newTransType}
                                                onChange={e => setNewTransType(e.target.value as any)}
                                            >
                                                <option value="expense">🔴 Despesa</option>
                                                <option value="income">🟢 Receita</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 shadow-lg shadow-purple-600/20 border-0">
                                        Adicionar
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* RECENT TRANSACTIONS LIST */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-800/30">
                                <div className="p-4 border-b border-white/5 bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm">Extrato Recente</h3>
                                    <div className="flex gap-2">
                                        {/* Filter placeholders could go here */}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-900/50 border-white/5">
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider">Descrição</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tipo</TableHead>
                                                <TableHead className="text-right text-slate-400 text-xs font-bold uppercase tracking-wider">Valor</TableHead>
                                                <TableHead className="text-right text-slate-400 text-xs font-bold uppercase tracking-wider">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.length === 0 && (
                                                <TableRow className="border-white/5 hover:bg-white/5">
                                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                        Nenhum lançamento encontrado.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {transactions.map(t => (
                                                <TableRow key={t.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                    <TableCell className="font-medium text-slate-200">{t.description}</TableCell>
                                                    <TableCell>
                                                        {t.type === 'expense' ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                                                <ArrowDownRight className="w-3 h-3 mr-1" /> Despesa
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                                                <ArrowUpRight className="w-3 h-3 mr-1" /> Receita
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-mono font-bold ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                        {t.type === 'expense' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                                                                onClick={() => handleEditTransaction(t)}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                                onClick={() => handleDeleteTransaction(t.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT TENANT SHEET */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Painel do Cliente</SheetTitle>
                        <SheetDescription>
                            Configurações da rádio <strong>{editingTenant?.name}</strong>.
                        </SheetDescription>
                    </SheetHeader>

                    {editingTenant && (
                        <div className="space-y-6 py-6">

                            {/* Acesso do Gestor */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                                <h3 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Acesso do Gestor
                                </h3>
                                <div className="space-y-2">
                                    <Label className="text-blue-900 text-xs uppercase font-bold">Link de Acesso</Label>
                                    <div className="flex gap-2">
                                        <Input disabled value={getTenantUrl(editForm.slug || 'slug')} className="bg-white text-xs" />
                                        <Button size="sm" variant="secondary" onClick={() => {
                                            navigator.clipboard.writeText(getTenantUrl(editForm.slug || 'slug'));
                                            toast.success("Link copiado!");
                                        }}>Copiar</Button>
                                    </div>
                                    <p className="text-[10px] text-blue-700">Envie este link para o dono da rádio.</p>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-blue-200">
                                    <Label className="text-blue-900 text-xs uppercase font-bold">Segurança (PIN)</Label>
                                    <div className="p-3 bg-white rounded border border-blue-100 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-blue-900" />
                                            <Input
                                                type="text"
                                                value={editForm.manager_pin || ''}
                                                onChange={e => setEditForm({ ...editForm, manager_pin: e.target.value })}
                                                placeholder={editingTenant.manager_pin ? "PIN Definido (Digite para alterar)" : "Definir novo PIN"}
                                                maxLength={6}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 pl-6">
                                            Defina um PIN de 4 a 6 dígitos para o gestor acessar o painel.
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* BASIC INFO */}
                            <div className="space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Contrato & Financeiro
                                </h3>
                                <div className="grid gap-2">
                                    <Label>Nome Fantasia</Label>
                                    <Input
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Slug (Proibido alterar em prod)</Label>
                                    <Input
                                        value={editForm.slug}
                                        onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                        className="bg-orange-50 font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black"
                                            value={editForm.status}
                                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                        >
                                            <option value="active">ATIVO</option>
                                            <option value="suspended">SUSPENSO</option>
                                            <option value="cancelled">CANCELADO</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Valor Mensal (R$)</Label>
                                        <Input
                                            type="number"
                                            value={editForm.subscription_price}
                                            onChange={e => setEditForm({ ...editForm, subscription_price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="grid gap-2 col-span-2">
                                        <Label>Validade do Plano (Expira em)</Label>
                                        <Input
                                            type="date"
                                            value={editForm.expires_at ? new Date(editForm.expires_at).toISOString().split('T')[0] : ''}
                                            onChange={e => {
                                                if (!e.target.value) {
                                                    setEditForm({ ...editForm, expires_at: null });
                                                    return;
                                                }
                                                // Fix Timezone Bug: Save as 12:00 PM UTC to be safe in most timezones (UTC-11 to UTC+12)
                                                // "2026-01-31" -> "2026-01-31T12:00:00.000Z"
                                                const dateWithNoon = new Date(`${e.target.value}T12:00:00`);
                                                setEditForm({ ...editForm, expires_at: dateWithNoon.toISOString() });
                                            }}
                                        />
                                        <p className="text-[10px] text-gray-500">Deixe em branco para acesso vitalício/indefinido.</p>
                                    </div>
                                </div>
                            </div>

                            {/* BRANDING */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Personalização App
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
                                            <div className="relative w-10 h-10 rounded border shadow-sm overflow-hidden shrink-0">
                                                <input
                                                    type="color"
                                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-0"
                                                    value={editForm.branding?.primary_color || '#1d244a'}
                                                    onChange={e => setEditForm({
                                                        ...editForm,
                                                        branding: { ...editForm.branding, primary_color: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <Input
                                                value={editForm.branding?.primary_color || ''}
                                                onChange={e => setEditForm({
                                                    ...editForm,
                                                    branding: { ...editForm.branding, primary_color: e.target.value }
                                                })}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cor Secundária</Label>
                                        <div className="flex gap-2">
                                            <div className="relative w-10 h-10 rounded border shadow-sm overflow-hidden shrink-0">
                                                <input
                                                    type="color"
                                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-0"
                                                    value={editForm.branding?.secondary_color || '#ffffff'}
                                                    onChange={e => setEditForm({
                                                        ...editForm,
                                                        branding: { ...editForm.branding, secondary_color: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <Input
                                                value={editForm.branding?.secondary_color || ''}
                                                onChange={e => setEditForm({
                                                    ...editForm,
                                                    branding: { ...editForm.branding, secondary_color: e.target.value }
                                                })}
                                                placeholder="#ffffff"
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
