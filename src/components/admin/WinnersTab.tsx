import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, ExternalLink, Search, Eye, Copy, Check, Download, CalendarX } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

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
        email: string; // Added
        cpf: string; // Added
        instagram: string; // Added
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
    const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

    // Cleanup State
    const [isCleanupOpen, setIsCleanupOpen] = useState(false);
    const [cleanupDays, setCleanupDays] = useState("30");
    const [cleanupLoading, setCleanupLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchWinners = async () => {
            try {
                setLoading(true);
                // Use explicit type assertion for safety
                // Fetching all fields from participants so email/cpf/instagram are included
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
                    setWinners((data as unknown as Winner[]) || []);
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

    const handleExportWinners = () => {
        if (winners.length === 0) {
            toast({ title: "Vazio", description: "Sem dados para exportar." });
            return;
        }

        const headers = [
            "Data do Sorteio",
            "Jogo",
            "Ganhador",
            "Palpite",
            "Cidade",
            "Telefone",
            "CPF",
            "Email",
            "Instagram"
        ];

        const csvContent = winners.map(w => {
            const date = new Date(w.drawn_at).toLocaleDateString("pt-BR") + " " + new Date(w.drawn_at).toLocaleTimeString("pt-BR");
            const jogo = w.match ? `${w.match.team_a_name} x ${w.match.team_b_name}` : "Jogo Excluído";

            const clean = (t: string) => `"${(t || "").replace(/"/g, '""')}"`;

            if (!w.participant) {
                return [clean(date), clean(jogo), "Excluído", "-", "-", "-", "-", "-", "-"].join(";");
            }

            return [
                clean(date),
                clean(jogo),
                clean(w.participant.nome_completo),
                clean(`${w.participant.placar_time_a} x ${w.participant.placar_time_b}`),
                clean(w.participant.cidade),
                clean(w.participant.telefone),
                clean(w.participant.cpf),
                clean(w.participant.email),
                clean(w.participant.instagram)
            ].join(";");
        });

        const csvString = [headers.join(";"), ...csvContent].join("\r\n");
        const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ganhadores_palpite_premiado_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleCleanup = async () => {
        const days = parseInt(cleanupDays);
        if (isNaN(days) || days < 1) {
            toast({ title: "Inválido", description: "Digite um número de dias válido.", variant: "destructive" });
            return;
        }

        // Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Find winners OLDER than cutoff
        const oldWinners = winners.filter(w => new Date(w.drawn_at) < cutoffDate);

        if (oldWinners.length === 0) {
            toast({ title: "Nada a limpar", description: `Nenhum ganhador com mais de ${days} dias.` });
            setIsCleanupOpen(false);
            return;
        }

        if (!confirm(`Confirmar exclusão de ${oldWinners.length} ganhadores antigos (mais de ${days} dias)?\n\nEssa ação é irreversível.`)) return;

        setCleanupLoading(true);
        try {
            const idsToDelete = oldWinners.map(w => w.id);

            const { error } = await supabase
                .from('winners' as any)
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            setWinners(prev => prev.filter(w => !idsToDelete.includes(w.id)));
            toast({ title: "Limpeza Concluída", description: `${oldWinners.length} registros antigos removidos.` });
            setIsCleanupOpen(false);

        } catch (err: any) {
            console.error("Cleanup error:", err);
            toast({ title: "Erro", description: "Falha na limpeza.", variant: "destructive" });
        } finally {
            setCleanupLoading(false);
        }
    };

    const handleInstagramSearch = (nome: string, cidade: string) => {
        const query = `site:instagram.com "${nome}" "${cidade}"`;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        navigator.clipboard.writeText(nome);
        toast({ title: "Copiado!", description: "Nome copiado. Abrindo busca..." });

        window.open(url, '_blank');
    };

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado!", description: `${label} copiado.` });
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
            <CardHeader className="bg-[#1d244a] text-white flex flex-row items-center justify-between">
                <CardTitle>Histórico de Ganhadores ({winners.length})</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsCleanupOpen(true)}
                        className="text-red-600 bg-white hover:bg-red-50 border border-red-200"
                        title="Excluir ganhadores antigos"
                    >
                        <CalendarX className="w-4 h-4 mr-2" />
                        Limpar Antigos
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExportWinners}
                        className="text-[#1d244a] bg-white hover:bg-gray-100"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </Button>
                </div>
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
                                                    onClick={() => setSelectedWinner(winner)}
                                                    title="Ver Detalhes Completos"
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    disabled={!winner.participant}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => winner.participant && copyToClipboard(winner.participant.email, "Email")}
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

            <Dialog open={!!selectedWinner} onOpenChange={(open) => !open && setSelectedWinner(null)}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#1d244a]">Detalhes do Ganhador</DialogTitle>
                        <DialogDescription>
                            Informações completas para retirada do prêmio.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedWinner && selectedWinner.participant && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="font-semibold text-gray-500">Nome:</span>
                                    <span className="col-span-2 font-bold text-[#1d244a]">{selectedWinner.participant.nome_completo}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                    <span className="font-semibold text-gray-500">CPF:</span>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span>{selectedWinner.participant.cpf}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedWinner.participant!.cpf, "CPF")}>
                                            <Copy className="h-3 w-3 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                    <span className="font-semibold text-gray-500">Telefone:</span>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span>{selectedWinner.participant.telefone}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedWinner.participant!.telefone, "Telefone")}>
                                            <Copy className="h-3 w-3 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                                    <span className="font-semibold text-gray-500">Email:</span>
                                    <div className="col-span-2 flex items-center gap-2 overflow-hidden">
                                        <span className="truncate" title={selectedWinner.participant.email}>{selectedWinner.participant.email}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => copyToClipboard(selectedWinner.participant!.email, "Email")}>
                                            <Copy className="h-3 w-3 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="font-semibold text-gray-500">Instagram:</span>
                                    <span className="col-span-2">{selectedWinner.participant.instagram}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="font-semibold text-gray-500">Cidade:</span>
                                    <span className="col-span-2">{selectedWinner.participant.cidade}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                                <h4 className="font-semibold text-[#1d244a] text-sm mb-2">Dados do Jogo</h4>
                                {selectedWinner.match && (
                                    <div className="text-sm">
                                        <p className="font-medium text-[#1d244a]">{selectedWinner.match.team_a_name} x {selectedWinner.match.team_b_name}</p>
                                    </div>
                                )}
                                <div className="text-sm flex gap-2">
                                    <span className="text-gray-600">Palpite:</span>
                                    <span className="font-bold text-green-700">
                                        {selectedWinner.participant.placar_time_a} x {selectedWinner.participant.placar_time_b}
                                    </span>
                                </div>
                                <div className="text-sm flex gap-2">
                                    <span className="text-gray-600">Data do Sorteio:</span>
                                    <span>{new Date(selectedWinner.drawn_at).toLocaleString("pt-BR")}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setSelectedWinner(null)}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Dialog>

            {/* Cleanup Dialog */ }
    <Dialog open={isCleanupOpen} onOpenChange={setIsCleanupOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Limpar Ganhadores Antigos</DialogTitle>
                <DialogDescription>
                    Defina o prazo de validade para exclusão automática.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Excluir ganhadores com mais de:</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={cleanupDays}
                            onChange={(e) => setCleanupDays(e.target.value)}
                            min={1}
                            className="w-24"
                        />
                        <span className="text-gray-500">dias</span>
                    </div>
                    <p className="text-xs text-gray-500">
                        Isso apagará permanentemente os registros anteriores a {(() => {
                            const d = new Date();
                            d.setDate(d.getDate() - (parseInt(cleanupDays) || 0));
                            return d.toLocaleDateString();
                        })()}.
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCleanupOpen(false)}>Cancelar</Button>
                <Button
                    variant="destructive"
                    onClick={handleCleanup}
                    disabled={cleanupLoading}
                >
                    {cleanupLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Confirmar Exclusão
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
        </Card >
    );
};

export default WinnersTab;
