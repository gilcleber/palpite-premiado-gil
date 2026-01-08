import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

interface Winner {
    id: string; // ID from winners table
    participant_id: string;
    match_id: string;
    drawn_at: string;
    prize_claimed: boolean;
    participant: {
        nome_completo: string;
        cidade: string;
        telefone: string;
        escolha: string;
        placar_time_a: number;
        placar_time_b: number;
    } | null; // Handle null participant if deleted
    match: {
        team_a_name: string;
        team_b_name: string;
    } | null; // Handle null match if deleted
}

const WinnersTab = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchWinners = async () => {
            try {
                setLoading(true);
                // Use explicit type assertion for safety
                const { data, error } = await supabase
                    .from('winners' as any)
                    .select(`
                        *,
                        participant:palpites(*),
                        match:matches(team_a_name, team_b_name)
                    `)
                    .order('drawn_at', { ascending: false });

                if (error) throw error;

                if (mounted) {
                    setWinners(data || []);
                }
            } catch (error) {
                console.error("Error fetching winners:", error);
                if (mounted) {
                    toast({ title: "Erro", description: "Falha ao carregar histórico.", variant: "destructive" });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchWinners();

        return () => {
            mounted = false;
        };
    }, []);

    const deleteWinner = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este ganhador do histórico?")) return;

        try {
            const { error } = await supabase
                .from('winners' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setWinners(prev => prev.filter(w => w.id !== id));
            toast({ title: "Removido", description: "Ganhador removido do histórico." });
        } catch (error) {
            console.error("Error deleting winner:", error);
            toast({ title: "Erro", description: "Falha ao remover ganhador.", variant: "destructive" });
        }
    };

    const handleInstagramSearch = (nome: string, cidade: string) => {
        const query = `site:instagram.com "${nome}" "${cidade}"`;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        navigator.clipboard.writeText(nome);
        toast({ title: "Copiado!", description: "Nome copiado. Abrindo busca..." });

        window.open(url, '_blank');
    };

    const filteredWinners = winners.filter(w => {
        if (!w.participant) return false;

        const nome = w.participant.nome_completo?.toLowerCase() || '';
        const timeA = w.match?.team_a_name?.toLowerCase() || '';
        const timeB = w.match?.team_b_name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return nome.includes(search) || timeA.includes(search) || timeB.includes(search);
    });

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-[#1d244a] text-white">
                <CardTitle>Histórico de Ganhadores</CardTitle>
            </CardHeader>
            <CardContent className="p-6">

                <div className="relative mb-6">
                    <Input
                        placeholder="Buscar ganhador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1d244a]" />
                    </div>
                ) : filteredWinners.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 border rounded bg-gray-50">
                        Nenhum ganhador registrado ainda.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Jogo</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Palpite</TableHead>
                                    <TableHead>Cidade</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWinners.map((winner) => (
                                    <TableRow key={winner.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(winner.drawn_at).toLocaleDateString("pt-BR")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium">
                                            {winner.match ? `${winner.match.team_a_name} x ${winner.match.team_b_name}` : "Jogo excluído"}
                                        </TableCell>
                                        <TableCell className="font-bold text-[#1d244a]">
                                            {winner.participant ? winner.participant.nome_completo : "Participante excluído"}
                                        </TableCell>
                                        <TableCell>
                                            {winner.participant && (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                                    {winner.participant.placar_time_a} x {winner.participant.placar_time_b}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{winner.participant?.cidade}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const email = (winner.participant as any)?.email;
                                                        if (email) {
                                                            navigator.clipboard.writeText(email);
                                                            toast({ title: "Email Copiado", description: email });
                                                        } else {
                                                            toast({ title: "Sem Email", description: "Email não encontrado", variant: "destructive" });
                                                        }
                                                    }}
                                                    title="Copiar Email"
                                                    className="h-8 w-8 p-0"
                                                    disabled={!winner.participant}
                                                >
                                                    <span className="text-xs font-bold">@</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => winner.participant && handleInstagramSearch(winner.participant.nome_completo, winner.participant.cidade)}
                                                    title="Buscar no Instagram"
                                                    className="h-8 w-8 p-0"
                                                    disabled={!winner.participant}
                                                >
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteWinner(winner.id)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WinnersTab;
