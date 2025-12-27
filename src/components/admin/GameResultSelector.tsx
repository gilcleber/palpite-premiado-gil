
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Check } from "lucide-react";

const GameResultSelector = () => {
  const [scoreTeamA, setScoreTeamA] = useState<number>(0);
  const [scoreTeamB, setScoreTeamB] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [officialResult, setOfficialResult] = useState<{teamA: number, teamB: number} | null>(null);
  
  const handleScoreChange = (team: 'A' | 'B', value: number) => {
    if (value < 0) value = 0;
    if (team === 'A') {
      setScoreTeamA(value);
    } else {
      setScoreTeamB(value);
    }
  };

  const saveOfficialResult = async () => {
    try {
      setSaving(true);
      
      // Store the official result in local storage for now (in a real app, you would save this to the database)
      const result = { teamA: scoreTeamA, teamB: scoreTeamB };
      localStorage.setItem('official_result', JSON.stringify(result));
      setOfficialResult(result);
      
      toast({
        title: "Resultado salvo",
        description: `O resultado oficial foi definido como ${scoreTeamA}x${scoreTeamB}`,
      });
    } catch (error) {
      console.error("Error saving official result:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o resultado oficial",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadSavedResult = () => {
    const savedResult = localStorage.getItem('official_result');
    if (savedResult) {
      const result = JSON.parse(savedResult);
      setScoreTeamA(result.teamA);
      setScoreTeamB(result.teamB);
      setOfficialResult(result);
    }
  };

  // Load saved result when component mounts
  useState(() => {
    loadSavedResult();
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#1d244a] text-white">
        <CardTitle>Definir Resultado Oficial</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center mb-4">
            <p className="text-lg font-medium mb-2">Defina o resultado oficial do jogo:</p>
            <p className="text-sm text-gray-500">
              Este resultado será usado para filtrar os participantes que acertaram o palpite.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <p className="font-medium mb-2">Ponte Preta</p>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="h-10 w-10 rounded-l"
                  onClick={() => handleScoreChange('A', scoreTeamA - 1)}
                  disabled={scoreTeamA === 0}
                >
                  -
                </Button>
                <div className="h-10 w-16 flex items-center justify-center border-y bg-white">
                  {scoreTeamA}
                </div>
                <Button
                  variant="outline"
                  className="h-10 w-10 rounded-r"
                  onClick={() => handleScoreChange('A', scoreTeamA + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="text-2xl font-bold">x</div>

            <div className="text-center">
              <p className="font-medium mb-2">Guarani</p>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="h-10 w-10 rounded-l"
                  onClick={() => handleScoreChange('B', scoreTeamB - 1)}
                  disabled={scoreTeamB === 0}
                >
                  -
                </Button>
                <div className="h-10 w-16 flex items-center justify-center border-y bg-white">
                  {scoreTeamB}
                </div>
                <Button
                  variant="outline"
                  className="h-10 w-10 rounded-r"
                  onClick={() => handleScoreChange('B', scoreTeamB + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={saveOfficialResult}
            disabled={saving}
            className="bg-[#1d244a] hover:bg-[#1d244a]/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar Resultado Oficial
              </>
            )}
          </Button>

          {officialResult && (
            <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-md">
              <Check className="h-5 w-5 mr-2" />
              <span>
                Resultado oficial definido: <strong>{officialResult.teamA}x{officialResult.teamB}</strong>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameResultSelector;
