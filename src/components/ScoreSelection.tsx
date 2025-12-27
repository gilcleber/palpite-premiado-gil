import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoveLeft } from "lucide-react";

interface ScoreSelectionProps {
  selectedOption: "team1" | "draw" | "team2";
  handleScoreSelect: (score: string | null) => void;
  currentScore: string | null;
}

const ScoreSelection = ({
  selectedOption,
  handleScoreSelect,
  currentScore,
}: ScoreSelectionProps) => {
  // Generate all possible scores from 0x0 to 5x5
  const generateScores = () => {
    if (selectedOption === "draw") {
      // For draw, only show scores where both teams have same number of goals
      return [
        "0x0", "1x1", "2x2", "3x3", "4x4", "5x5"
      ];
    } else if (selectedOption === "team1") {
      // For team1 win, show scores where team1 has more goals
      return [
        "1x0", "2x0", "2x1", "3x0", "3x1", "3x2",
        "4x0", "4x1", "4x2", "4x3", "5x0", "5x1",
        "5x2", "5x3", "5x4"
      ];
    } else {
      // For team2 win, show scores where team2 has more goals
      return [
        "0x1", "0x2", "1x2", "0x3", "1x3", "2x3",
        "0x4", "1x4", "2x4", "3x4", "0x5", "1x5",
        "2x5", "3x5", "4x5"
      ];
    }
  };

  const scores = generateScores();

  // If a score is selected, show only that score and a change button
  if (currentScore) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="text-center text-blue-100 font-medium mb-2">
          Placar Escolhido
        </div>
        <div className="scale-125 transform transition-all">
          <Button
            type="button"
            variant="outline"
            className="bg-blue-100 border-blue-500 text-blue-900 font-bold px-8 py-6 text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            onClick={() => { }} // No action on click, already selected
          >
            {currentScore === "muitoMais" ? "Muito Mais" : currentScore}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10 gap-2 mt-4"
          onClick={() => handleScoreSelect(null)}
        >
          <MoveLeft className="w-4 h-4" /> Alterar Placar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {selectedOption === "draw" ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {scores.map((score) => (
            <Button
              key={score}
              type="button"
              variant="outline"
              className={cn(
                "text-sm py-2 px-2 h-auto hover:scale-105 transition-transform",
                currentScore === score && "bg-blue-100 border-blue-500"
              )}
              onClick={() => handleScoreSelect(score)}
            >
              {score}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            className={cn(
              "text-sm py-2 px-2 h-auto hover:scale-105 transition-transform",
              currentScore === "muitoMais" && "bg-blue-100 border-blue-500"
            )}
            onClick={() => handleScoreSelect("muitoMais")}
          >
            Muito Mais
          </Button>
        </div>
      ) : (
        <>
          {selectedOption && (
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div className="text-center mb-4 text-sm text-blue-100">
                Selecione o placar final da partida
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {scores.map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant="outline"
                    className={cn(
                      "text-sm py-2 px-2 h-auto hover:scale-105 transition-transform",
                      currentScore === score && "bg-blue-100 border-blue-500"
                    )}
                    onClick={() => handleScoreSelect(score)}
                  >
                    {score}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "text-sm py-2 px-2 h-auto hover:scale-105 transition-transform",
                    currentScore === "muitoMais" && "bg-blue-100 border-blue-500"
                  )}
                  onClick={() => handleScoreSelect("muitoMais")}
                >
                  Muito Mais
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScoreSelection;
