import { useState, useEffect } from "react";
import { Trophy, Instagram, CheckCircle2 } from "lucide-react"; // Import new icons
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PersonalInfoSection from "./PersonalInfoSection";
import TeamSelection from "./TeamSelection";
import ScoreSelection from "./ScoreSelection";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type FormData = {
  fullName: string;
  email: string;
  instagram: string;
  cpf: string;
  phone: string;
  city: string;
  selectedOption: "team1" | "draw" | "team2" | null;
  team1Name: string;
  team2Name: string;
  score: string | null;
};

// Custom Success Modal Component
export const SuccessModal = ({ open, onOpenChange, instagramHandle }: { open: boolean, onOpenChange: (open: boolean) => void, instagramHandle?: string }) => {
  const handleFollow = () => {
    // Try to open Instagram App, fallback to Web
    const handle = instagramHandle?.replace('@', '') || "radiobandeirantescampinas";
    const appUrl = `instagram://user?username=${handle}`;
    const webUrl = `https://www.instagram.com/${handle}`;

    // Simple heuristic: Try updated window location or just open standard link which usually handles both
    window.open(webUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1d244a] to-[#2a3459] border-blue-400/30 text-white">
        <DialogHeader className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Palpite Registrado!</DialogTitle>
          <DialogDescription className="text-blue-100 text-center text-lg">
            Boa sorte! Seu palpite foi salvo com sucesso.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-600/20 rounded-lg">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-pink-400">Atenção: Regra Obrigatória</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Para validar seu prêmio, você <strong>DEVE</strong> estar seguindo nosso perfil no Instagram:
              </p>
              <p className="text-lg font-bold text-white mt-1">
                {instagramHandle || "@radiobandeirantescampinas"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:justify-center gap-3 mt-4">
          <button
            onClick={handleFollow}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            Seguir no Instagram
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
          >
            Já estou seguindo / Fechar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BettingForm = ({ matchId: propMatchId }: { matchId?: string }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    instagram: "",
    cpf: "",
    phone: "",
    city: "",
    selectedOption: null,
    team1Name: "Time A",
    team2Name: "Time B",
    score: null,
  });

  const [isEditing, setIsEditing] = useState({
    team1: false,
    team2: false,
  });

  const [loading, setLoading] = useState(false);
  const [gameDate, setGameDate] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false); // Success Modal State
  const [instagramHandle, setInstagramHandle] = useState<string>("@radiobandeirantescampinas"); // Configured Handle

  const [logos, setLogos] = useState<{ team1: string | null; team2: string | null }>({
    team1: null,
    team2: null,
  });

  // Load App Settings
  useEffect(() => {
    const fetchAppSettings = async () => {
      const { data } = await supabase.from('app_settings').select('instagram_handle').single();
      if (data) {
        const settings = data as any;
        if (settings.instagram_handle) {
          setInstagramHandle(settings.instagram_handle);
        }
      }
    };
    fetchAppSettings();
  }, []);

  const [matchId, setMatchId] = useState<string | null>(null);

  const [matchDetails, setMatchDetails] = useState<{
    team1Name: string;
    team2Name: string;
    team1Logo: string | null;
    team2Logo: string | null;
    drawDate?: string;
    championship_name?: string; // Added
  }>({
    team1Name: "",
    team2Name: "",
    team1Logo: null,
    team2Logo: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch latest active match from the new table
        let query = supabase.from("matches" as any).select("id, team_a_name, team_b_name, team_a_logo, team_b_logo, draw_date, championship_name");

        if (propMatchId) {
          query = query.eq('id', propMatchId);
        } else {
          query = query.eq('status', 'open').order('created_at', { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();

        if (!error && data) {
          const typedData = data as any;
          setMatchId(typedData.id); // Save Match ID

          if (typedData.draw_date) {
            setGameDate(typedData.draw_date);
          }

          setFormData(prev => ({
            ...prev,
            team1Name: typedData.team_a_name || "Time A", // Note column name changes
            team2Name: typedData.team_b_name || "Time B"
          }));

          setLogos({
            team1: typedData.team_a_logo,
            team2: typedData.team_b_logo,
          });

          setMatchDetails({
            team1Name: typedData.team_a_name || "Time A",
            team2Name: typedData.team_b_name || "Time B",
            team1Logo: typedData.team_a_logo,
            team2Logo: typedData.team_b_logo,
            drawDate: typedData.draw_date,
            championship_name: typedData.championship_name
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, [propMatchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTeamNameChange = (team: "team1" | "team2", value: string) => {
    if (team === "team1") {
      setFormData({ ...formData, team1Name: value });
    } else {
      setFormData({ ...formData, team2Name: value });
    }
  };

  const toggleEdit = (team: "team1" | "team2") => {
    setIsEditing({
      ...isEditing,
      [team]: !isEditing[team],
    });
  };

  const handleOptionSelect = (option: "team1" | "draw" | "team2") => {
    setFormData({
      ...formData,
      selectedOption: option,
      score: null
    });
  };

  const handleScoreSelect = (score: string | null) => {
    setFormData({ ...formData, score });
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Por favor, insira seu nome completo");
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return false;
    }

    if (!formData.instagram.trim()) {
      toast.error("Por favor, insira seu Instagram");
      return false;
    }

    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, "").length !== 11) {
      toast.error("Por favor, insira um CPF válido");
      return false;
    }

    // Validating for 10 or 11 digits (Landline or Mobile), but strictly numbers
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim() || cleanPhone.length < 10) {
      toast.error("Por favor, insira um telefone válido com DDD (mínimo 10 dígitos)");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("Por favor, insira sua cidade");
      return false;
    }

    if (!formData.selectedOption) {
      toast.error("Por favor, escolha uma opção de resultado");
      return false;
    }

    if (formData.selectedOption !== "draw" && !formData.score) {
      toast.error("Por favor, selecione um placar");
      return false;
    }

    if (formData.selectedOption === "draw" && !formData.score) {
      toast.error("Por favor, selecione um placar para o empate");
      return false;
    }

    return true;
  };

  const parseScore = (score: string | null) => {
    if (!score || score === "muitoMais") return { a: null, b: null };
    const parts = score.split("x");
    if (parts.length === 2) {
      return { a: parseInt(parts[0]), b: parseInt(parts[1]) };
    }
    return { a: null, b: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const effectiveDate = gameDate || new Date().toISOString().split('T')[0];

      const { data: existingBet, error: checkError } = await supabase
        .from("palpites")
        .select("id")
        .eq("cpf", formData.cpf)
        .eq("game_date", effectiveDate)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing bet", checkError);
        toast.error("Erro ao verificar cadastro. Tente novamente.");
        setLoading(false);
        return;
      }

      if (existingBet) {
        toast.error("Você já registrou um palpite para este jogo!");
        setLoading(false);
        return;
      }

      // 2. Insert new bet
      const { a, b } = parseScore(formData.score);

      // Cast payload to any to include 'email' which is not in the generated types yet
      const insertPayload: any = {
        nome_completo: formData.fullName,
        email: formData.email,
        cidade: formData.city,
        cpf: formData.cpf,
        telefone: formData.phone,
        instagram_handle: formData.instagram,
        time_a: formData.team1Name,
        time_b: formData.team2Name,
        placar_time_a: a,
        placar_time_b: b,
        escolha: formData.selectedOption || "",
        game_date: effectiveDate,
        match_id: matchId // Link bet to specific match
      };

      const { error: insertError } = await supabase.from("palpites").insert(insertPayload);

      if (insertError) {
        console.error("❌ ERRO AO SALVAR PALPITE:", insertError);
        console.error("📦 Payload que tentou salvar:", insertPayload);
        console.error("🔍 Detalhes do erro:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });

        // Show detailed error to user for debugging
        toast.error(`Erro ao salvar: ${insertError.message}. Código: ${insertError.code || 'N/A'}. Entre em contato com o suporte.`);
        setLoading(false);
        return;
      }

      console.log("✅ PALPITE SALVO COM SUCESSO!", {
        nome: formData.fullName,
        cpf: formData.cpf,
        matchId: matchId
      });

      // Show Success Modal instead of just toast
      setShowSuccess(true);
      // toast.success("Seu palpite foi registrado com sucesso!"); 

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        instagram: "",
        cpf: "",
        phone: "",
        city: "",
        selectedOption: null,
        team1Name: formData.team1Name,
        team2Name: formData.team2Name,
        score: null,
      });

    } catch (error) {
      console.error("Unexpected error", error);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Trophy className="h-8 w-8 text-[#d19563]" />
          </div>
          <h1 className="text-2xl font-bold text-white">PALPITE PREMIADO</h1>
          {matchDetails.championship_name && (
            <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider border border-white/20">
              {matchDetails.championship_name}
            </div>
          )}
          <p className="text-gray-200 mt-2">
            Preencha seus dados e escolha o placar para participar do sorteio
          </p>
        </div>

        <PersonalInfoSection formData={formData} handleChange={handleChange} />

        <div className="border-t border-gray-200 my-6"></div>

        <TeamSelection
          formData={formData}
          isEditing={isEditing}
          handleTeamNameChange={handleTeamNameChange}
          toggleEdit={toggleEdit}
          handleOptionSelect={handleOptionSelect}
          teamALogo={logos.team1}
          teamBLogo={logos.team2}
        />

        {formData.selectedOption && (
          <ScoreSelection
            selectedOption={formData.selectedOption}
            handleScoreSelect={handleScoreSelect}
            currentScore={formData.score}
          />
        )}

        <div className="pt-4">
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#d19563] hover:bg-[#b07b4e] text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? "Enviando..." : "Confirmar Palpite"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Seus dados serão usados apenas para o sorteio e não serão compartilhados.
          Apenas um palpite por jogo.
        </p>
      </form>
      <SuccessModal open={showSuccess} onOpenChange={setShowSuccess} />
    </>
  );
};

export default BettingForm;
