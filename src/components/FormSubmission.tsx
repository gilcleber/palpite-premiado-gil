
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const FormSubmission = () => {
  return (
    <div className="mt-10 flex flex-col items-center animate-scale-in">
      <Button 
        type="submit" 
        className="w-full max-w-md h-16 text-lg font-bold bg-gradient-to-r from-[#1d244a] to-[#d19563] hover:from-[#1d244a]/90 hover:to-[#d19563]/90 transition-all duration-300 transform hover:scale-105 active:scale-95 touch-optimized button-modern border-0 shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <Trophy className="h-6 w-6 animate-float" />
          <span className="text-white">Participar do Sorteio</span>
        </div>
      </Button>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-white/80 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/20">
          🔒 Seus dados estão seguros e protegidos
        </p>
      </div>
    </div>
  );
};

export default FormSubmission;
