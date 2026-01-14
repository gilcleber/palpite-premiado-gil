import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Search, Clock } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { useTenant } from "@/hooks/useTenant";

interface Team {
    id: string;
    name: string;
    logo_url: string | null;
    tenant_id: string | null;
    approved: boolean;
}

const TeamLibrary = () => {
    const { tenant } = useTenant();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({ name: "", logo_url: "" });
    const [saving, setSaving] = useState(false);

    const fetchTeams = async () => {
        if (!tenant) return;
        setLoading(true);

        // Fetch approved teams OR teams created by this tenant
        const { data, error } = await supabase
            .from("teams" as any)
            .select("*")
            .or(`approved.eq.true,tenant_id.eq.${tenant.id}`)
            .order("name", { ascending: true });

        if (error) {
            toast({ title: "Erro", description: "Falha ao carregar times.", variant: "destructive" });
        } else {
            setTeams((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTeams();
    }, [tenant]);

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setFormData({ name: team.name, logo_url: team.logo_url || "" });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingTeam(null);
        setFormData({ name: "", logo_url: "" });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast({ title: "Atenção", description: "Nome do time é obrigatório.", variant: "destructive" });
            return;
        }

        if (!tenant) {
            toast({ title: "Erro", description: "Tenant não identificado.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            if (editingTeam) {
                // Update
                const { error } = await supabase
                    .from("teams" as any)
                    .update({ name: formData.name, logo_url: formData.logo_url })
                    .eq("id", editingTeam.id);
                if (error) throw error;
                toast({ title: "Sucesso", description: "Time atualizado!" });
            } else {
                // Create - Auto-assign tenant_id and set approved = false
                const { error } = await supabase
                    .from("teams" as any)
                    .insert({
                        name: formData.name,
                        logo_url: formData.logo_url,
                        tenant_id: tenant.id,
                        approved: false
                    });
                if (error) throw error;
                toast({
                    title: "Sucesso",
                    description: "Time criado! Aguardando aprovação do Master Admin para aparecer em todas as rádios.",
                    duration: 5000
                });
            }
            setIsModalOpen(false);
            fetchTeams();
        } catch (e) {
            console.error(e);
            toast({ title: "Erro", description: "Falha ao salvar time.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este time?")) return;

        const { error } = await supabase
            .from("teams" as any)
            .delete()
            .eq("id", id);

        if (error) {
            toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
        } else {
            toast({ title: "Excluído", description: "Time removido." });
            setTeams(teams.filter(t => t.id !== id));
        }
    };

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar time..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="bg-[#1d244a] text-white hover:bg-[#2a3459]">
                    <Plus className="w-4 h-4 mr-2" /> Novo Time
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredTeams.map(team => (
                        <Card key={team.id} className="group relative overflow-hidden hover:shadow-lg transition-all border-0 bg-white/50">
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-white rounded-full p-2 shadow-sm flex items-center justify-center">
                                    {team.logo_url ? (
                                        <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} />
                                    ) : (
                                        <span className="text-xs text-gray-300">Sem Logo</span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-center truncate w-full text-[#1d244a]" title={team.name}>
                                    {team.name}
                                </span>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" onClick={() => handleEdit(team)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(team.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTeam ? "Editar Time" : "Novo Time"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome do Time</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Flamengo"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Logo</label>
                            <ImageUpload
                                bucketName="images"
                                currentImageUrl={formData.logo_url}
                                onUploadComplete={url => setFormData(prev => ({ ...prev, logo_url: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, logo_url: "" }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-[#1d244a]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamLibrary;
