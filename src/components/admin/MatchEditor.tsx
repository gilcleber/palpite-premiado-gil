import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Trash2, Plus } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface MatchData {
    id?: string;
    team_a_name: string;
    team_b_name: string;
    team_a_logo: string | null;
    team_b_logo: string | null;
    draw_date: string | null;
    prize_title: string;
    prize_description: string;
    prize_image_url: string | null;
    prize_gallery: string[];
    status: string;
}

interface MatchEditorProps {
    matchId: string | null; // Null = Create New
    onBack: () => void;
    onSave: () => void;
}

const MatchEditor = ({ matchId, onBack, onSave }: MatchEditorProps) => {
    const [loading, setLoading] = useState(false); // Init false, set true if fetching
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState<MatchData>({
        team_a_name: "",
        team_b_name: "",
        team_a_logo: null,
        team_b_logo: null,
        draw_date: null,
        prize_title: "",
        prize_description: "",
        prize_image_url: null,
        prize_gallery: [],
        status: "open"
    });

    // Load data if editing
    useEffect(() => {
        if (matchId) {
            const loadMatch = async () => {
                setLoading(true);
                const { data: match, error } = await supabase.from("matches").select("*").eq("id", matchId).single();
                if (error) {
                    toast({ title: "Erro", description: "Falha ao carregar jogo.", variant: "destructive" });
                    onBack();
                    return;
                }
                if (match) {
                    // Type safely map fields
                    setData({
                        id: match.id,
                        team_a_name: match.team_a_name,
                        team_b_name: match.team_b_name,
                        team_a_logo: match.team_a_logo,
                        team_b_logo: match.team_b_logo,
                        draw_date: match.draw_date,
                        prize_title: match.prize_title || "",
                        prize_description: match.prize_description || "",
                        prize_image_url: match.prize_image_url,
                        prize_gallery: (match.prize_gallery as string[]) || [],
                        status: match.status || "open"
                    });
                }
                setLoading(false);
            };
            loadMatch();
        }
    }, [matchId]);

    const handleSave = async () => {
        if (!data.team_a_name || !data.team_b_name) {
            toast({ title: "Atenção", description: "Preencha o nome dos times.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                team_a_name: data.team_a_name,
                team_b_name: data.team_b_name,
                team_a_logo: data.team_a_logo,
                team_b_logo: data.team_b_logo,
                draw_date: data.draw_date,
                prize_title: data.prize_title,
                prize_description: data.prize_description,
                prize_image_url: data.prize_image_url,
                prize_gallery: data.prize_gallery,
                status: data.status,
                updated_at: new Date().toISOString(),
            };

            if (matchId) {
                // Update
                const { error } = await supabase.from("matches").update(payload).eq("id", matchId);
                if (error) throw error;
                toast({ title: "Sucesso", description: "Jogo atualizado!" });
            } else {
                // Create
                const { error } = await supabase.from("matches").insert([payload]);
                if (error) throw error;
                toast({ title: "Criado", description: "Novo jogo criado com sucesso!" });
            }
            onSave(); // Go back to list
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao salvar.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Helper Inputs
    const handlePropChange = (field: keyof MatchData, val: any) => setData({ ...data, [field]: val });

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                <h2 className="text-xl font-bold text-[#1d244a]">{matchId ? "Editar Jogo" : "Criar Novo Jogo"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teams */}
                <Card>
                    <CardHeader><CardTitle>Times</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Time A (Mandante)</label>
                            <Input value={data.team_a_name} onChange={e => handlePropChange("team_a_name", e.target.value)} placeholder="Ex: Flamengo" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Logo A</label>
                            <ImageUpload
                                bucketName="images"
                                currentImageUrl={data.team_a_logo}
                                onUploadComplete={url => handlePropChange("team_a_logo", url)}
                                onClear={() => handlePropChange("team_a_logo", null)}
                            />
                        </div>
                        <div className="border-t pt-4">
                            <label className="text-sm font-medium">Time B (Visitante)</label>
                            <Input value={data.team_b_name} onChange={e => handlePropChange("team_b_name", e.target.value)} placeholder="Ex: Vasco" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Logo B</label>
                            <ImageUpload
                                bucketName="images"
                                currentImageUrl={data.team_b_logo}
                                onUploadComplete={url => handlePropChange("team_b_logo", url)}
                                onClear={() => handlePropChange("team_b_logo", null)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule & Main Prize */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Data & Horário</CardTitle></CardHeader>
                        <CardContent>
                            <Input
                                type="datetime-local"
                                value={data.draw_date ? new Date(data.draw_date).toISOString().slice(0, 16) : ""}
                                onChange={e => handlePropChange("draw_date", new Date(e.target.value).toISOString())}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Prêmio Principal</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Título do Prêmio" value={data.prize_title} onChange={e => handlePropChange("prize_title", e.target.value)} />
                            <Textarea placeholder="Descrição" value={data.prize_description} onChange={e => handlePropChange("prize_description", e.target.value)} />
                            <div className="space-y-2">
                                <label className="text-sm">Imagem de Capa</label>
                                <ImageUpload
                                    bucketName="images"
                                    currentImageUrl={data.prize_image_url}
                                    onUploadComplete={url => handlePropChange("prize_image_url", url)}
                                    onClear={() => handlePropChange("prize_image_url", null)}
                                />
                            </div>
                            {/* Gallery Logic Simplified */}
                            <div className="space-y-2 pt-2 border-t">
                                <label className="text-sm">Galeria ({data.prize_gallery.length} fotos)</label>
                                <ImageUpload
                                    label="Adicionar Foto à Galeria"
                                    bucketName="images"
                                    onUploadComplete={url => handlePropChange("prize_gallery", [...data.prize_gallery, url])}
                                    onClear={() => { }}
                                />
                                <div className="flex gap-2 flex-wrap">
                                    {data.prize_gallery.map((url, i) => (
                                        <div key={i} className="relative w-16 h-16 border rounded bg-gray-100">
                                            <img src={url} className="w-full h-full object-cover rounded" />
                                            <button onClick={() => {
                                                const newG = [...data.prize_gallery];
                                                newG.splice(i, 1);
                                                handlePropChange("prize_gallery", newG);
                                            }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">x</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button size="lg" onClick={handleSave} disabled={saving} className="bg-[#1d244a] text-white">
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} {matchId ? "Salvar Alterações" : "Criar Jogo"}
                </Button>
            </div>
        </div>
    );
};

export default MatchEditor;
