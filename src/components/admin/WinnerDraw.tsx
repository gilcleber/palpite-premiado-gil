
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Award, Send } from "lucide-react";
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

const WinnerDraw = () => {
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [correctGuesses, setCorrectGuesses] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    filterCorrectGuesses();
  }, [allParticipants]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const filterCorrectGuesses = () => {
    const savedResult = localStorage.getItem('official_result');
    if (!savedResult) {
      setCorrectGuesses([]);
      return;
    }

    const officialResult = JSON.parse(savedResult);
    const filtered = allParticipants.filter(
      p => p.placar_time_a === officialResult.teamA && p.placar_time_b === officialResult.teamB
    );
    
    setCorrectGuesses(filtered);
  };

  const drawWinner = () => {
    if (correctGuesses.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há participantes com palpites corretos para sortear.",
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
      description: "Função de envio para NDI ainda não implementada. Esta é uma funcionalidade avançada que requer integração específica com o vMix.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#1d244a] text-white">
        <CardTitle>Sorteio do Vencedor</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <p className="text-lg font-medium mb-2">
            Participantes com o palpite correto: {correctGuesses.length}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {localStorage.getItem('official_result') 
              ? `Resultado oficial: ${JSON.parse(localStorage.getItem('official_result')!).teamA}x${JSON.parse(localStorage.getItem('official_result')!).teamB}`
              : "Resultado oficial ainda não definido"}
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
