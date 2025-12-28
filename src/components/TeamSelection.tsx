import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormData } from "./BettingForm";
import { Shield } from "lucide-react";

interface TeamSelectionProps {
  formData: FormData;
  isEditing: {
    team1: boolean;
    team2: boolean;
  };
  handleTeamNameChange: (team: "team1" | "team2", value: string) => void;
  toggleEdit: (team: "team1" | "team2") => void;
  handleOptionSelect: (option: "team1" | "draw" | "team2") => void;
  teamALogo?: string | null;
  teamBLogo?: string | null;
}

const TeamSelection = ({
  formData,
  handleOptionSelect,
  teamALogo,
  teamBLogo
}: TeamSelectionProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h3 className="text-xl font-semibold text-center text-blue-100 mb-6 drop-shadow-md">
        Escolha sua opção para o jogo
      </h3>

      {/* Teams Display - Logos e Nomes */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-8 mb-8">

        {/* Team A */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center p-0">
            {teamALogo ? (
              <img src={teamALogo} alt={formData.team1Name} className="w-full h-full object-contain drop-shadow-2xl transition-transform hover:scale-110" />
            ) : (
              <Shield className="w-16 h-16 text-white/50" />
            )}
          </div>
          <span className="text-white font-bold text-sm sm:text-base tracking-wide text-center max-w-[120px] leading-tight drop-shadow-md">
            {formData.team1Name}
          </span>
        </div>

        {/* VS Badge */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#d19563] rounded-full flex items-center justify-center shadow-lg transform rotate-3 border-2 border-white/20">
            <span className="text-white font-black text-sm sm:text-lg italic">VS</span>
          </div>
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center p-0">
            {teamBLogo ? (
              <img src={teamBLogo} alt={formData.team2Name} className="w-full h-full object-contain drop-shadow-2xl transition-transform hover:scale-110" />
            ) : (
              <Shield className="w-16 h-16 text-white/50" />
            )}
          </div>
          <span className="text-white font-bold text-sm sm:text-base tracking-wide text-center max-w-[120px] leading-tight drop-shadow-md">
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
