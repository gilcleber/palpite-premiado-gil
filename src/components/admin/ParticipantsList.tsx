
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Define columns
    const headers = [
      "Nome Completo",
      "Cidade",
      "Telefone",
      "CPF",
      "Escolha",
      "Placar A",
      "Placar B",
      "Data do Palpite",
      "Instagram",
      "Total de Participações" // New column
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

      // Clean data to avoid CSV breaks
      const clean = (text: string) => `"${(text || "").replace(/"/g, '""')}"`;

      return [
        clean(row.nome_completo),
        clean(row.cidade),
        clean(row.telefone),
        clean(row.cpf),
        clean(row.escolha),
        row.placar_time_a,
        row.placar_time_b,
        clean(createdDate),
        // @ts-ignore - instagram might not be in interface yet but is in DB
        clean(row.instagram_handle || ""),
        count // Add count column
      ].join(";");
    });

    // Combine headers and data
    const csvString = [headers.join(";"), ...csvContent].join("\r\n");

    // Add Byte Order Mark for UTF-8 (fixes generic encoding issues in Excel)
    const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `participantes_palpite_premiado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("palpites")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setParticipants(data || []);
      setFilteredParticipants(data || []);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#1d244a] text-white">
        <CardTitle>Lista de Participantes</CardTitle>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
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
