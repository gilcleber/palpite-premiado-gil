
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormData } from "./BettingForm";

interface TeamSelectionProps {
  formData: FormData;
  isEditing: {
    team1: boolean;
    team2: boolean;
  };
  handleTeamNameChange: (team: "team1" | "team2", value: string) => void;
  toggleEdit: (team: "team1" | "team2") => void;
  handleOptionSelect: (option: "team1" | "draw" | "team2") => void;
}

const TeamSelection = ({
  formData,
  handleOptionSelect
}: TeamSelectionProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h3 className="text-xl font-semibold text-center text-blue-800 mb-6">
        Escolha sua opção para o jogo
      </h3>

      {/* Teams Display - Simples e claro */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-blue-200 shadow-lg">
          <span className="text-lg font-bold text-blue-800">
            {formData.team1Name}
          </span>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-lg shadow-lg">
          <span className="text-xl font-bold text-white">VS</span>
        </div>

        <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-blue-200 shadow-lg">
          <span className="text-lg font-bold text-blue-800">
            {formData.team2Name}
          </span>
        </div>
      </div>

      {/* Selection Buttons */}
      {/* Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(formData.selectedOption === null || formData.selectedOption === "team1") && (
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-20 text-base font-semibold transition-all duration-300 touch-optimized button-modern",
              "bg-white/95 backdrop-blur-sm border-2 border-blue-300 text-blue-800 hover:bg-blue-600 hover:text-white shadow-lg",
              formData.selectedOption === "team1" && "bg-blue-600 text-white border-blue-600 shadow-xl scale-105 col-start-2 sm:col-start-auto"
            )}
            onClick={() => handleOptionSelect("team1")}
          >
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Vitória</div>
              <div className="font-bold text-lg">{formData.team1Name}</div>
            </div>
          </Button>
        )}

        {(formData.selectedOption === null || formData.selectedOption === "draw") && (
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-20 text-base font-semibold transition-all duration-300 touch-optimized button-modern",
              "bg-white/95 backdrop-blur-sm border-2 border-blue-300 text-blue-800 hover:bg-blue-500 hover:text-white shadow-lg",
              formData.selectedOption === "draw" && "bg-blue-500 text-white border-blue-500 shadow-xl scale-105 col-start-2 sm:col-start-auto"
            )}
            onClick={() => handleOptionSelect("draw")}
          >
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Resultado</div>
              <div className="font-bold text-lg">Empate</div>
            </div>
          </Button>
        )}

        {(formData.selectedOption === null || formData.selectedOption === "team2") && (
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-20 text-base font-semibold transition-all duration-300 touch-optimized button-modern",
              "bg-white/95 backdrop-blur-sm border-2 border-blue-300 text-blue-800 hover:bg-blue-600 hover:text-white shadow-lg",
              formData.selectedOption === "team2" && "bg-blue-600 text-white border-blue-600 shadow-xl scale-105 col-start-2 sm:col-start-auto"
            )}
            onClick={() => handleOptionSelect("team2")}
          >
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Vitória</div>
              <div className="font-bold text-lg">{formData.team2Name}</div>
            </div>
          </Button>
        )}

        {formData.selectedOption && (
          <div className="col-span-1 sm:col-span-3 flex justify-center mt-4">
            <Button
              variant="ghost"
              onClick={() => handleOptionSelect(null as any)}
              className="text-blue-800 hover:bg-blue-100"
            >
              Alterar Escolha
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelection;
