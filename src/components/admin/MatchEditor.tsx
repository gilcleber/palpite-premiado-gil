import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Trash2, Plus, Copy, ExternalLink, Search, Shield } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { format } from "date-fns";

interface MatchEditorProps {
    matchId: string | null; // If null, we are creating a new one
    onSaveSuccess: (newId?: string) => void;
    onCancel?: () => void;
}

const MatchEditor = ({ matchId, onSaveSuccess, onCancel }: MatchEditorProps) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Team Library State
    const [teams, setTeams] = useState<any[]>([]);
    const [teamSelectorOpen, setTeamSelectorOpen] = useState<'A' | 'B' | null>(null);
    const [teamSearch, setTeamSearch] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        team_a_name: "",
        team_b_name: "",
        team_a_logo: "",
        team_b_logo: "",
        draw_date: "",
        draw_time: "",
        prize_title: "",
        prize_description: "",
        prize_image_url: "",
        prize_gallery: [] as string[],
        championship_name: "",
        slug: "", // Added
        game_date: "",
        game_time: ""
    });

    useEffect(() => {
        // Fetch teams for the library
        const fetchTeams = async () => {
            const { data } = await supabase.from('teams' as any).select('*').order('name');
            if (data) setTeams(data);
        };
        fetchTeams();
    }, []);

    // Load Match Data
    useEffect(() => {
        const loadMatch = async () => {
            if (!matchId) return; // New mode
            setLoading(true);

            const { data, error } = await supabase.from("matches" as any).select("*").eq("id", matchId).single();
            if (error) {
                toast({ title: "Erro", description: "Falha ao carregar jogo.", variant: "destructive" });
            } else if (data) {
                const match = data as any;
                // Parse date/time
                let dDate = "";
                let dTime = "";
                if (match.draw_date) {
                    const dateObj = new Date(match.draw_date);
                    dDate = dateObj.toLocaleDateString('pt-BR').split('/').reverse().join('-'); // YYYY-MM-DD
                    dTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                }

                setFormData({
                    team_a_name: match.team_a_name || "",
                    team_b_name: match.team_b_name || "",
                    team_a_logo: match.team_a_logo || "",
                    team_b_logo: match.team_b_logo || "",
                    draw_date: dDate,
                    draw_time: dTime,
                    prize_title: match.prize_title || "",
                    prize_description: match.prize_description || "",
                    prize_image_url: match.prize_image_url || "",
                    prize_gallery: (match.prize_gallery as string[]) || [],
                    championship_name: match.championship_name || "",
                    slug: match.slug || "", // Added
                    game_date: match.game_date ? new Date(match.game_date).toLocaleDateString('pt-BR').split('/').reverse().join('-') : "",
                    game_time: match.game_date ? new Date(match.game_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ""
                });
            }
            setLoading(false);
        };

        if (matchId) {
            loadMatch();
        } else {
            // RESET FORM FOR NEW GAME
            setFormData({
                team_a_name: "",
                team_b_name: "",
                team_a_logo: "",
                team_b_logo: "",
                draw_date: "",
                draw_time: "",
                prize_title: "",
                prize_description: "",
                prize_image_url: "",
                prize_gallery: [],
                championship_name: "",
                slug: "", // Added
                game_date: "",
                game_time: ""
            });
        }
    }, [matchId]);

    const handleChange = (field: string, value: any) => {
        // Auto-generate slug if title or team names change and slug is empty
        if ((field === "team_a_name" || field === "team_b_name") && !formData.slug) {
            // Logic handled in effect or simply let user type?
            // Let's just update the field normally
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Standard Description Template
    const DEFAULT_DESCRIPTION = "3 Ouvintes que acertarem o placar exato ganham: [PRÊMIO AQUI].\n\nRegra: Caso haja menos de 3 acertadores, os prêmios restantes acumulam para o próximo jogo!";

    useEffect(() => {
        if (!matchId && !formData.prize_description) {
            setFormData(prev => ({ ...prev, prize_description: DEFAULT_DESCRIPTION }));
        }
    }, [matchId]);

    const handleSave = async () => {
        if (!formData.team_a_name || !formData.team_b_name) {
            toast({ title: "Atenção", description: "Preencha os nomes dos times.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            // Construct Timestamp
            let finalDate = null;
            if (formData.draw_date && formData.draw_time) {
                finalDate = new Date(`${formData.draw_date}T${formData.draw_time}`).toISOString();
            }

            // Construct Game Timestamp
            let gameDate = null;
            if (formData.game_date && formData.game_time) {
                gameDate = new Date(`${formData.game_date}T${formData.game_time}`).toISOString();
            }

            const payload = {
                team_a_name: formData.team_a_name,
                team_b_name: formData.team_b_name,
                team_a_logo: formData.team_a_logo,
                team_b_logo: formData.team_b_logo,
                draw_date: finalDate,
                game_date: gameDate, // Added
                prize_title: formData.prize_title,
                prize_description: formData.prize_description,
                prize_image_url: formData.prize_image_url,
                prize_gallery: formData.prize_gallery,
                championship_name: formData.championship_name,
                slug: formData.slug || null // Added
            };

            if (matchId) {
                const { error } = await supabase.from("matches" as any).update(payload).eq("id", matchId);
                if (error) throw error;
                toast({ title: "Salvo!", description: "Dados da partida atualizados." });
                onSaveSuccess();
            } else {
                const { data, error } = await supabase
                    .from('matches' as any)
                    .upsert(payload)
                    .select()
                    .single();
                if (error) throw error;
                toast({ title: "Criado!", description: "Nova partida criada com sucesso." });
                if (data) onSaveSuccess((data as any).id);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Erro", description: "Erro ao salvar partida.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!matchId) return;
        if (!confirm("Tem certeza que deseja excluir este jogo? Essa ação não pode ser desfeita.")) return;

        setSaving(true);
        const { error } = await supabase.from("matches" as any).delete().eq("id", matchId);
        setSaving(false);

        if (error) {
            toast({ title: "Erro", description: "Falha ao excluir jogo.", variant: "destructive" });
        } else {
            toast({ title: "Excluído", description: "Jogo removido com sucesso." });
            onSaveSuccess(); // Trigger refresh (parent will handle tab switch if logic provided, but simpler to just reload)
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Carregando partida...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* HEADER ACTIONS (Link Copy) */}
            {matchId && (
                <div className="flex justify-end gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-800 flex items-center mr-auto px-2">
                        <strong>Link:</strong>&nbsp;{formData.slug || matchId.slice(0, 8) + "..."}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => {
                        const baseUrl = window.location.origin + window.location.pathname;
                        // Use slug if available, otherwise ID
                        const identifier = formData.slug ? formData.slug : matchId;
                        const finalUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `#/game/${identifier}`;
                        navigator.clipboard.writeText(finalUrl);
                        toast({ title: "Copiado", description: "Link da partida copiado!" });
                    }}>
                        <Copy className="w-4 h-4 mr-2" /> Copiar Link
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        const baseUrl = window.location.origin + window.location.pathname;
                        const identifier = formData.slug ? formData.slug : matchId;
                        const finalUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `#/game/${identifier}`;
                        window.open(finalUrl, '_blank');
                    }}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Ver Página
                    </Button>
                </div>
            )}

            {/* CARD 1: PARTIDA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-fit">
                <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
                    <CardTitle className="text-white">Configurações da Partida</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Team A */}
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-[#1d244a]">Time A (Mandante)</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setTeamSelectorOpen('A')}
                                    className="text-xs h-7"
                                >
                                    <Search className="w-3 h-3 mr-1" /> Selecionar
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Time</label>
                                <Input
                                    value={formData.team_a_name}
                                    onChange={e => handleChange("team_a_name", e.target.value)}
                                    placeholder="Ex: Brasil"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Logo do Time</label>
                                <ImageUpload
                                    bucketName="images"
                                    currentImageUrl={formData.team_a_logo}
                                    onUploadComplete={url => handleChange("team_a_logo", url)}
                                    onClear={() => handleChange("team_a_logo", "")}
                                />
                            </div>
                        </div>

                        {/* Team B */}
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-[#1d244a]">Time B (Visitante)</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setTeamSelectorOpen('B')}
                                    className="text-xs h-7"
                                >
                                    <Search className="w-3 h-3 mr-1" /> Selecionar
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Time</label>
                                <Input
                                    value={formData.team_b_name}
                                    onChange={e => handleChange("team_b_name", e.target.value)}
                                    placeholder="Ex: Argentina"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Logo do Time</label>
                                <ImageUpload
                                    bucketName="images"
                                    currentImageUrl={formData.team_b_logo}
                                    onUploadComplete={url => handleChange("team_b_logo", url)}
                                    onClear={() => handleChange("team_b_logo", "")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* TEAM SELECTOR MODAL */}
                    <Dialog open={!!teamSelectorOpen} onOpenChange={(open) => !open && setTeamSelectorOpen(null)}>
                        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Selecionar Time ({teamSelectorOpen === 'A' ? 'Mandante' : 'Visitante'})</DialogTitle>
                            </DialogHeader>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar time..."
                                    className="pl-10"
                                    value={teamSearch}
                                    onChange={e => setTeamSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto p-2">
                                {teams
                                    .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
                                    .map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => {
                                                if (teamSelectorOpen === 'A') {
                                                    setFormData(prev => ({ ...prev, team_a_name: team.name, team_a_logo: team.logo_url || "" }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, team_b_name: team.name, team_b_logo: team.logo_url || "" }));
                                                }
                                                setTeamSelectorOpen(null);
                                                setTeamSearch("");
                                            }}
                                            className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg border transition-all hover:scale-105"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-sm flex items-center justify-center border">
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} />
                                                ) : (
                                                    <Shield className="w-6 h-6 text-gray-300" />
                                                )}
                                            </div>
                                            <span className="text-xs text-center font-medium truncate w-full">{team.name}</span>
                                        </button>
                                    ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Championship Name */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Campeonato</label>
                                <Input
                                    value={formData.championship_name}
                                    onChange={e => handleChange("championship_name", e.target.value)}
                                    placeholder="Ex: Brasileirão Série B"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link Personalizado (Slug)</label>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">palpitepremiado.com/#/game/</span>
                                    <Input
                                        value={formData.slug}
                                        onChange={e => handleChange("slug", e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="ex: guarani-x-ponte"
                                        className="bg-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Deixe em branco para usar o ID padrão.</p>
                            </div>
                        </div>
                    </div>

                    {/* Date / Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Data do Sorteio</label>
                            <Input type="date" value={formData.draw_date} onChange={e => handleChange("draw_date", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horário</label>
                            <Input type="time" value={formData.draw_time} onChange={e => handleChange("draw_time", e.target.value)} />
                        </div>
                    </div>

                    {/* Game Date / Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Data do Jogo</label>
                            <Input type="date" value={formData.game_date} onChange={e => handleChange("game_date", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horário do Jogo</label>
                            <Input type="time" value={formData.game_time} onChange={e => handleChange("game_time", e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CARD 2: PREMIOS */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-[#d19563] text-white rounded-t-lg">
                    <CardTitle className="text-white">Gerenciar Prêmios</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Main Prize */}
                    <div className="p-4 border-2 border-[#d19563]/20 rounded-xl bg-[#d19563]/5 relative">
                        <div className="absolute top-0 right-0 bg-[#d19563] text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">
                            PRINCIPAL
                        </div>
                        <h3 className="font-bold text-lg text-[#d19563] mb-4">🏆 Prêmio Principal (Destaque)</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título</label>
                                <Input value={formData.prize_title} onChange={e => handleChange("prize_title", e.target.value)} className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descrição</label>
                                <Textarea value={formData.prize_description} onChange={e => handleChange("prize_description", e.target.value)} className="bg-white" rows={2} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Imagem Principal (Capa)</label>
                                <ImageUpload
                                    bucketName="images"
                                    currentImageUrl={formData.prize_image_url}
                                    onUploadComplete={url => handleChange("prize_image_url", url)}
                                    onClear={() => handleChange("prize_image_url", "")}
                                />
                            </div>

                            {/* Gallery */}
                            <div className="space-y-2 pt-4 border-t border-[#d19563]/20">
                                <label className="text-sm font-medium">Galeria de Fotos (Opcional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    {formData.prize_gallery.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <button onClick={() => {
                                                const newG = [...formData.prize_gallery];
                                                newG.splice(idx, 1);
                                                handleChange("prize_gallery", newG);
                                            }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <ImageUpload
                                    label="Adicionar foto à Galeria"
                                    bucketName="images"
                                    onUploadComplete={url => handleChange("prize_gallery", [...formData.prize_gallery, url])}
                                    onClear={() => { }}
                                />
                            </div>
                        </div>

                        {/* NOTE: We removed the "Prêmios Extras" subsection from here because it requires a separate relation. 
                    In the future, we can add a sub-component here to list/add Prizes linked to this matchId. 
                    For now, focusing on the Main Prize as per the new structure. 
                    If the user wants Extra Prizes per game, we need a PrizeList component that accepts matchId. 
                */}
                    </div>
                </CardContent>
            </Card>

            <div className="sticky bottom-4 z-50 flex gap-4">
                {matchId && (
                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        size="lg"
                        disabled={saving}
                    >
                        <Trash2 className="mr-2" /> EXCLUIR JOGO
                    </Button>
                )}
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="lg"
                    className="w-full shadow-2xl bg-[#1d244a] hover:bg-[#2a3459] text-white border-2 border-white/20"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} SALVAR DADOS DO JOGO
                </Button>
            </div>
        </div>
    );
};

export default MatchEditor;
