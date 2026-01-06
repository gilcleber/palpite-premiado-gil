import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Copy, Edit, Trash2, Calendar, Trophy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Match {
    id: string;
    team_a_name: string;
    team_b_name: string;
    draw_date: string;
    status: string;
    main_prize_image: string | null;
}

interface MatchListProps {
    onEdit: (matchId: string) => void;
    onCreate: () => void;
}

const MatchList = ({ onEdit, onCreate }: MatchListProps) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        try {
            const { data, error } = await supabase
                .from("matches")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setMatches(data || []);
        } catch (error) {
            console.error("Error loading matches:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os jogos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleCopyLink = (id: string) => {
        const link = `${window.location.origin}/game/${id}`;
        navigator.clipboard.writeText(link);
        toast({ title: "Link Copiado!", description: "Link do jogo copiado para a área de transferência." });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este jogo? Todos os palpites serão apagados.")) return;

        try {
            const { error } = await supabase.from("matches").delete().eq("id", id);
            if (error) throw error;
            setMatches(matches.filter(m => m.id !== id));
            toast({ title: "Jogo excluído", description: "O jogo foi removido com sucesso." });
        } catch (error) {
            toast({ title: "Erro", description: "Erro ao excluir jogo.", variant: "destructive" });
        }
    };

    if (loading) return <div className="text-center p-8">Carregando jogos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-xl font-bold text-[#1d244a]">Seus Jogos</h2>
                    <p className="text-sm text-gray-500">Gerencie partidas e copie os links para divulgar.</p>
                </div>
                <Button onClick={onCreate} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Criar Novo Jogo
                </Button>
            </div>

            {matches.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Trophy className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum jogo criado</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">Crie seu primeiro jogo para começar a receber palpites.</p>
                        <Button onClick={onCreate} variant="outline">Criar Jogo Agora</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((match) => (
                        <Card key={match.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-[#1d244a] text-lg">
                                            {match.team_a_name} <span className="text-gray-400 text-sm">vs</span> {match.team_b_name}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {match.draw_date ? format(new Date(match.draw_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Data não definida"}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${match.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {match.status === 'open' ? 'ABERTO' : 'FINALIZADO'}
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyLink(match.id)}>
                                        <Copy className="h-3 w-3 mr-2" /> Link
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`/game/${match.id}`, '_blank')}>
                                        <ExternalLink className="h-3 w-3 mr-2" /> Ver
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => onEdit(match.id)}>
                                        <Edit className="h-3 w-3 mr-2" /> Editar
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(match.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchList;
