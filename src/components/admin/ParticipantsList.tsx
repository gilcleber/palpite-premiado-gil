
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Participant {
  id: string;
  nome_completo: string;
  cidade: string;
  telefone: string;
  cpf: string;
  time_a: string;
  time_b: string;
  escolha: string;
  placar_time_a: number;
  placar_time_b: number;
  created_at: string;
  email?: string;
  instagram_handle?: string;
}

const ParticipantsList = ({ matchId }: { matchId: string | null }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParticipants();
  }, [matchId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParticipants(participants);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredParticipants(
        participants.filter(
          (p) =>
            p.nome_completo.toLowerCase().includes(lowercasedSearch) ||
            p.cidade.toLowerCase().includes(lowercasedSearch) ||
            p.telefone.toLowerCase().includes(lowercasedSearch) ||
            p.cpf.toLowerCase().includes(lowercasedSearch) ||
            (p.placar_time_a + "x" + p.placar_time_b).includes(searchTerm)
        )
      );
    }
  }, [searchTerm, participants]);

  /* New state for match details */
  const [matchName, setMatchName] = useState("jogo");
  const [teamNames, setTeamNames] = useState({ team1: "Time A", team2: "Time B" });

  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId) return;
      const { data } = await supabase.from('matches' as any).select('team_a_name, team_b_name').eq('id', matchId).single();
      if (data) {
        const d = data as any;
        setTeamNames({ team1: d.team_a_name, team2: d.team_b_name });
        setMatchName(`${d.team_a_name}_vs_${d.team_b_name}`);
      }
    };
    fetchMatchDetails();
  }, [matchId]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o participante ${name}? Essa ação não pode ser desfeita.`)) return;

    try {
      const { error } = await supabase
        .from('palpites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParticipants(prev => prev.filter(p => p.id !== id));
      // Re-filter handled by useEffect deps [participants]
      toast.success("Participante excluído com sucesso.");
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("Erro ao excluir participante.");
    }
  };

  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Define columns
    const headers = [
      "Nome Completo",
      "E-mail", // Added Email
      "Cidade",
      "Telefone",
      "CPF",
      "Time Escolhido", // Translated header
      "Placar A",
      "Placar B",
      "Data do Palpite",
      "Instagram",
      "Total de Participações"
    ];

    // Calculate participation counts based on CPF for ALL participants (not just filtered)
    const participationCounts = new Map<string, number>();
    participants.forEach(p => {
      const key = p.cpf.replace(/\D/g, ""); // Normalize CPF
      participationCounts.set(key, (participationCounts.get(key) || 0) + 1);
    });

    // Map data to CSV format (using semicolon for Excel compatibility in Brazil)
    const csvContent = filteredParticipants.map(row => {
      const createdDate = new Date(row.created_at).toLocaleDateString("pt-BR");
      const cpfKey = row.cpf.replace(/\D/g, "");
      const count = participationCounts.get(cpfKey) || 1;

      // Translate choice
      let escolhaTraduzida = row.escolha;
      if (row.escolha === 'team1') escolhaTraduzida = teamNames.team1;
      else if (row.escolha === 'team2') escolhaTraduzida = teamNames.team2;
      else if (row.escolha === 'draw') escolhaTraduzida = 'Empate';

      // Clean data to avoid CSV breaks
      const clean = (text: string) => `"${(text || "").replace(/"/g, '""')}"`;

      return [
        clean(row.nome_completo),
        // @ts-ignore - email might not be in interface yet but is in DB
        clean(row.email || ""), // Add Email
        clean(row.cidade),
        clean(row.telefone),
        clean(row.cpf),
        clean(escolhaTraduzida),
        row.placar_time_a,
        row.placar_time_b,
        clean(createdDate),
        // @ts-ignore - instagram might not be in interface yet but is in DB
        clean(row.instagram_handle || ""),
        count
      ].join(";");
    });

    // Combine headers and data
    const csvString = [headers.join(";"), ...csvContent].join("\r\n");

    // Add Byte Order Mark for UTF-8 (fixes generic encoding issues in Excel)
    const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });

    // Create download link with dynamic filename
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const sanitizedMatchName = matchName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `participantes_${sanitizedMatchName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadParticipants = async () => {
    try {
      setLoading(true);

      // 1. Load all participants
      const participantsQuery = supabase
        .from("palpites")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false });

      // 2. Load winners to exclude
      const winnersQuery = supabase
        .from('winners' as any)
        .select('participant_id')
        .eq('match_id', matchId);

      const [participantsResult, winnersResult] = await Promise.all([participantsQuery, winnersQuery]);

      if (participantsResult.error) throw participantsResult.error;

      const allParticipants = participantsResult.data || [];
      const winnerIds = (winnersResult.data || []).map((w: any) => w.participant_id);

      // 3. Filter out winners
      const nonWinners = allParticipants.filter(p => !winnerIds.includes(p.id));

      setParticipants(nonWinners);
      setFilteredParticipants(nonWinners);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#1d244a] text-white">
        <CardTitle>👥 Participantes ({filteredParticipants.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Buscar por nome, cidade, telefone ou palpite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-[#d19563] text-[#d19563] hover:bg-[#d19563] hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel (CSV)
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#1d244a]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Time Escolhido</TableHead>
                  <TableHead>Palpite</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.nome_completo}</TableCell>
                      <TableCell>{participant.cidade}</TableCell>
                      <TableCell>{participant.telefone}</TableCell>
                      <TableCell>{participant.cpf}</TableCell>
                      <TableCell>
                        {participant.escolha === "team1"
                          ? participant.time_a
                          : participant.escolha === "team2"
                            ? participant.time_b
                            : participant.escolha === "draw"
                              ? "Empate"
                              : participant.escolha}
                      </TableCell>
                      <TableCell>
                        {participant.placar_time_a}x{participant.placar_time_b}
                      </TableCell>
                      <TableCell>
                        {new Date(participant.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(participant.id, participant.nome_completo)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Excluir Participante"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhum participante encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;
