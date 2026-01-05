import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PersonalInfoSection from "./PersonalInfoSection";
import TeamSelection from "./TeamSelection";
import ScoreSelection from "./ScoreSelection";
import FormSubmission from "./FormSubmission";

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

const BettingForm = () => {
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

  const [logos, setLogos] = useState<{ team1: string | null; team2: string | null }>({
    team1: null,
    team2: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();

        if (!error && data) {
          const typedData = data as any;
          if (typedData.draw_date) {
            setGameDate(typedData.draw_date);
          }

          setFormData(prev => ({
            ...prev,
            team1Name: typedData.team_a || "Time A",
            team2Name: typedData.team_b || "Time B"
          }));

          setLogos({
            team1: typedData.team_a_logo_url,
            team2: typedData.team_b_logo_url,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

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

    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, insira um telefone válido");
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
        game_date: effectiveDate
      };

      const { error: insertError } = await supabase.from("palpites").insert(insertPayload);

      if (insertError) {
        console.error("Error inserting bet", insertError);
        toast.error("Erro ao salvar palpite. Tente novamente.");
        setLoading(false);
        return;
      }

      toast.success("Seu palpite foi registrado com sucesso!");

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
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Trophy className="h-8 w-8 text-[#d19563]" />
        </div>
        <h1 className="text-2xl font-bold text-white">PALPITE PREMIADO</h1>
        <p className="text-gray-200 mt-1">
          Preencha seus dados e escolha o cartaz para participar do sorteio
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
  );
};

export default BettingForm;
