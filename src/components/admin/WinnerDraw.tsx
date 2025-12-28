import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Award, Send, Save, Check } from "lucide-react";
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
  game_date?: string; // Optinal for backward compatibility
}

const WinnerDraw = () => {
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [correctGuesses, setCorrectGuesses] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'correct' | 'all'>('correct');

  // Score State
  const [scoreTeamA, setScoreTeamA] = useState<number>(0);
  const [scoreTeamB, setScoreTeamB] = useState<number>(0);
  const [savingScore, setSavingScore] = useState(false);
  const [officialResult, setOfficialResult] = useState<{ teamA: number, teamB: number } | null>(null);
  const [currentGameDate, setCurrentGameDate] = useState<string | null>(null);

  /* Load settings to get current draw date for filtering */
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [allParticipants, drawMode, officialResult, currentGameDate]); // Added currentGameDate to dependencies

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadParticipants(), loadSettings()]); // Changed loadOfficialResult to loadSettings
    setLoading(false);
  };

  const loadSettings = async () => { // Renamed from loadOfficialResult to loadSettings
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('score_team_a, score_team_b, draw_date') // Added draw_date to select
        .single();

      if (data) {
        setScoreTeamA(data.score_team_a || 0);
        setScoreTeamB(data.score_team_b || 0);
        setOfficialResult({
          teamA: data.score_team_a || 0,
          teamB: data.score_team_b || 0
        });

        // Store Draw Date for filtering
        if (data.draw_date) {
          // Convert ISO string to YYYY-MM-DD for comparison
          const dateOnly = data.draw_date.split('T')[0];
          setCurrentGameDate(dateOnly);
        }

        // Also update localStorage for backward compatibility or other components
        localStorage.setItem('official_result', JSON.stringify({
          teamA: data.score_team_a || 0,
          teamB: data.score_team_b || 0
        }));
      }
    } catch (err) {
      console.error("Error loading official result:", err);
    }
  };

  const saveOfficialResult = async () => {
    try {
      setSavingScore(true);

      const { error } = await supabase
        .from('app_settings')
        .update({
          score_team_a: scoreTeamA,
          score_team_b: scoreTeamB
        })
        .gt('id', 0);

      if (error) throw error;

      setOfficialResult({ teamA: scoreTeamA, teamB: scoreTeamB });
      localStorage.setItem('official_result', JSON.stringify({ teamA: scoreTeamA, teamB: scoreTeamB }));

      toast({
        title: "Resultado salvo",
        description: `O resultado oficial foi definido como ${scoreTeamA}x${scoreTeamB}`,
      });
    } catch (error) {
      console.error("Error saving official result:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o resultado oficial.",
        variant: "destructive",
      });
    } finally {
      setSavingScore(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("palpites")
        .select("*");

      if (error) throw error;

      setAllParticipants(data || []);
    } catch (error) {
      console.error("Error loading participants:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os participantes",
        variant: "destructive",
      });
    }
  };

  const filterParticipants = () => {
    // First, filter by date if set
    let eligible = allParticipants;

    if (currentGameDate) {
      eligible = allParticipants.filter(p => {
        if (!p.game_date) return false; // Skip if no game date
        return p.game_date === currentGameDate;
      });
    }

    if (drawMode === 'all') {
      setCorrectGuesses(eligible);
      return;
    }

    if (!officialResult) {
      setCorrectGuesses([]);
      return;
    }

    const filtered = eligible.filter(
      p => p.placar_time_a === officialResult.teamA && p.placar_time_b === officialResult.teamB
    );

    setCorrectGuesses(filtered);
  };

  const drawWinner = () => {
    if (correctGuesses.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há participantes para sortear na categoria selecionada.",
        variant: "destructive",
      });
      return;
    }

    setDrawing(true);

    // Animation for drawing winner
    let counter = 0;
    const totalIterations = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * correctGuesses.length);
      setWinner(correctGuesses[randomIndex]);
      counter++;

      if (counter >= totalIterations) {
        clearInterval(interval);
        setDrawing(false);

        toast({
          title: "Vencedor sorteado!",
          description: `${correctGuesses[randomIndex].nome_completo} foi o vencedor do sorteio!`,
        });

        // Store winner in localStorage
        localStorage.setItem('winner', JSON.stringify(correctGuesses[randomIndex]));
      }
    }, 100);
  };

  const sendToNDI = () => {
    if (!winner) {
      toast({
        title: "Aviso",
        description: "Sorteie um vencedor antes de enviar para o NDI.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "NDI",
      description: "Função de envio para NDI ainda não implementada.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#1d244a] text-white">
        <CardTitle>Sorteio do Vencedor & Resultado Oficial</CardTitle>
      </CardHeader>
      <CardContent className="p-6">

        {/* Official Result Selector */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-[#1d244a] mb-4 text-center text-lg">Definir Placar Oficial</h3>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center space-x-6">
              {/* Team A */}
              <div className="flex items-center">
                <Button
                  variant="outline" size="sm"
                  className="h-10 w-10 rounded-l-md border-r-0"
                  onClick={() => setScoreTeamA(Math.max(0, scoreTeamA - 1))}
                >
                  -
                </Button>
                <div className="h-10 w-12 flex items-center justify-center border-y border-input bg-white font-bold text-lg">
                  {scoreTeamA}
                </div>
                <Button
                  variant="outline" size="sm"
                  className="h-10 w-10 rounded-r-md border-l-0"
                  onClick={() => setScoreTeamA(scoreTeamA + 1)}
                >
                  +
                </Button>
              </div>

              <span className="text-xl font-bold text-gray-400">X</span>

              {/* Team B */}
              <div className="flex items-center">
                <Button
                  variant="outline" size="sm"
                  className="h-10 w-10 rounded-l-md border-r-0"
                  onClick={() => setScoreTeamB(Math.max(0, scoreTeamB - 1))}
                >
                  -
                </Button>
                <div className="h-10 w-12 flex items-center justify-center border-y border-input bg-white font-bold text-lg">
                  {scoreTeamB}
                </div>
                <Button
                  variant="outline" size="sm"
                  className="h-10 w-10 rounded-r-md border-l-0"
                  onClick={() => setScoreTeamB(scoreTeamB + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              onClick={saveOfficialResult}
              disabled={savingScore}
              size="sm"
              className="bg-[#1d244a] hover:bg-[#2a3459]"
            >
              {savingScore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Placar Oficial
            </Button>

            {officialResult && (
              <div className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <Check className="h-3 w-3 mr-1" />
                Placar Atual: {officialResult.teamA} x {officialResult.teamB}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-6 border-t pt-6">
          {/* Draw Mode Selection */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={drawMode === 'correct' ? 'default' : 'outline'}
              onClick={() => { setDrawMode('correct'); setWinner(null); }}
              className={drawMode === 'correct' ? 'bg-[#d19563] hover:bg-[#b07b4e]' : ''}
            >
              <Award className="w-4 h-4 mr-2" />
              Acertadores do Placar
            </Button>
            <Button
              variant={drawMode === 'all' ? 'default' : 'outline'}
              onClick={() => { setDrawMode('all'); setWinner(null); }}
              className={drawMode === 'all' ? 'bg-[#d19563] hover:bg-[#b07b4e]' : ''}
            >
              <Award className="w-4 h-4 mr-2" />
              Todos os Participantes
            </Button>
          </div>

          <p className="text-lg font-medium mb-2">
            Participantes elegíveis para sorteio: <span className="text-[#d19563] font-bold text-xl">{correctGuesses.length}</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {drawMode === 'correct' ? (
              officialResult
                ? `Filtrando por: ${officialResult.teamA}x${officialResult.teamB}`
                : "Defina o placar oficial acima para filtrar."
            ) : "Filtrando por: Todos os palpites registrados"}
          </p>

          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={drawWinner}
              disabled={drawing || correctGuesses.length === 0}
              className="bg-[#1d244a] hover:bg-[#1d244a]/90"
            >
              {drawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sorteando...
                </>
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" /> Sortear Vencedor
                </>
              )}
            </Button>

            <Button
              onClick={sendToNDI}
              disabled={!winner}
              variant="outline"
            >
              <Send className="mr-2 h-4 w-4" /> Enviar para NDI
            </Button>
          </div>

          {winner && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Vencedor do Sorteio
              </h3>
              <p className="text-2xl font-bold mb-2">
                {winner.nome_completo}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-left">
                  <p><strong>Cidade:</strong> {winner.cidade}</p>
                  <p><strong>Telefone:</strong> {winner.telefone}</p>
                </div>
                <div className="text-left">
                  <p><strong>Time escolhido:</strong> {winner.escolha}</p>
                  <p><strong>Palpite:</strong> {winner.placar_time_a}x{winner.placar_time_b}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#1d244a]" />
          </div>
        ) : correctGuesses.length > 0 ? (
          <div className="overflow-x-auto">
            <h3 className="font-medium mb-2">Participantes com palpites corretos:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Time Escolhido</TableHead>
                  <TableHead>Palpite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {correctGuesses.map((participant) => (
                  <TableRow
                    key={participant.id}
                    className={winner && winner.id === participant.id ? "bg-green-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {participant.nome_completo}
                      {winner && winner.id === participant.id && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" /> Vencedor
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{participant.cidade}</TableCell>
                    <TableCell>{participant.telefone}</TableCell>
                    <TableCell>{participant.escolha}</TableCell>
                    <TableCell>
                      {participant.placar_time_a}x{participant.placar_time_b}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">
              {localStorage.getItem('official_result')
                ? "Nenhum participante acertou o resultado oficial."
                : "Defina o resultado oficial na aba 'Resultado Oficial' para ver os participantes com palpites corretos."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WinnerDraw;
