
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScoreSelectionProps {
  selectedOption: "team1" | "draw" | "team2";
  handleScoreSelect: (score: string) => void;
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

  return (
    <div className="space-y-4">
      {selectedOption === "draw" ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {scores.map((score) => (
            <Button
              key={score}
              type="button"
              variant="outline"
              className={cn(
                "text-sm py-1 px-2 h-auto",
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
              "text-sm py-1 px-2 h-auto",
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
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-center mb-2 text-sm text-gray-600">
                Selecione um time ou empate para ver as opções de placar
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {scores.map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant="outline"
                    className={cn(
                      "text-sm py-1 px-2 h-auto",
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
                    "text-sm py-1 px-2 h-auto",
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
