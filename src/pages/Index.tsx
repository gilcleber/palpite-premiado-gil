
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import BettingForm from "@/components/BettingForm";
import PrizeAnnouncement from "@/components/PrizeAnnouncement";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { isAdmin } = useAuth();

  const [radioLogo, setRadioLogo] = useState<string>("./radio_logo.png");
  const [radioSlogan, setRadioSlogan] = useState<string | null>(null);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      const { data } = await supabase.from('app_settings').select('radio_logo_url, radio_slogan').single();
      if (data) {
        if (data.radio_logo_url) setRadioLogo(data.radio_logo_url);
        if (data.radio_slogan) setRadioSlogan(data.radio_slogan);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (matchId) {
        setLoadingMatches(false);
        return;
      }

      const { data } = await supabase
        .from('matches' as any)
        .select('*')
        .eq('visible', true) // Only show visible matches
        .order('draw_date', { ascending: true });

      if (data) {
        setAvailableMatches(data);
      }
      setLoadingMatches(false);
    };

    fetchMatches();
  }, [matchId]);

  // View Mode Logic
  // 1. If matchId is present -> Show Specific Game
  // 2. If !matchId but only 1 game -> Show Specific Game (Auto-select)
  // 3. If !matchId and >1 games -> Show Lobby
  // 4. If !matchId and 0 games -> Show Empty State

  const showLobby = !matchId && availableMatches.length > 1;
  const singleMatchId = matchId || (availableMatches.length === 1 ? availableMatches[0].id : null);
  const showGame = !!singleMatchId;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden safe-area-inset-top safe-area-inset-bottom">
      {/* Background with blue gradient */}
      <div className="fixed inset-0 bg-[#1d244a]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        {/* Radio Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden pb-32">
          <img
            src={radioLogo}
            alt="Radio Logo"
            className="w-[80%] md:w-[60%] lg:w-[40%] opacity-[0.08] mix-blend-normal grayscale blur-[0.5px] transition-all duration-700 pointer-events-none"
          />
          {radioSlogan && (
            <p className="mt-4 text-white/10 text-xl md:text-3xl font-bold uppercase tracking-widest text-center max-w-2xl px-4">
              {radioSlogan}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8 px-4">
        {showLobby ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Jogos Disponíveis</h1>
              <p className="text-blue-200">Escolha um jogo para participar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableMatches.map((match) => (
                <Card
                  key={match.id}
                  className="group relative overflow-hidden border-0 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  onClick={() => navigate(`/game/${match.id}`)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-6">

                    {match.championship_name && (
                      <div className="absolute top-0 inset-x-0 bg-black/20 backdrop-blur-sm py-1.5 text-center">
                        <span className="text-[#d19563] text-xs font-bold uppercase tracking-widest">
                          {match.championship_name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-8 w-full mt-4">
                      {/* Team A */}
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform">
                          {match.team_a_logo ? (
                            <img src={match.team_a_logo} alt={match.team_a_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">Logo</div>
                          )}
                        </div>
                        <span className="text-white font-bold text-lg md:text-xl truncate max-w-[120px]">{match.team_a_name}</span>
                      </div>

                      <span className="text-2xl font-black text-[#d19563]">X</span>

                      {/* Team B */}
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform">
                          {match.team_b_logo ? (
                            <img src={match.team_b_logo} alt={match.team_b_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">Logo</div>
                          )}
                        </div>
                        <span className="text-white font-bold text-lg md:text-xl truncate max-w-[120px]">{match.team_b_name}</span>
                      </div>
                    </div>

                    <div className="w-full pt-4 border-t border-white/10 space-y-3">
                      {match.draw_date && (
                        <div className="bg-white/10 rounded-full px-4 py-1 text-sm text-blue-100 inline-flex items-center gap-2 mx-auto">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.draw_date).toLocaleDateString('pt-BR')} às {new Date(match.draw_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <p className="text-[#d19563] font-bold text-lg uppercase tracking-widest group-hover:text-white transition-colors">
                        Participe Agora
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : showGame ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="animate-fade-in">
              <PrizeAnnouncement matchId={singleMatchId} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Card className="border-0 shadow-none bg-transparent overflow-hidden">
                <CardContent className="p-0">
                  <BettingForm matchId={singleMatchId} />
                </CardContent>
              </Card>
            </div>

            {/* Show "Back" button if valid stored match but we are at root, or if simply want navigation */}
            {!matchId && availableMatches.length > 1 && (
              <div className="text-center">
                <Button variant="link" className="text-white/50 hover:text-white" onClick={() => setAvailableMatches([...availableMatches]) /* Force re-eval or just reload */}>
                  Ver outros jogos
                </Button>
                {/* Actually, if we auto-selected single match, no back button needed. 
                      If we are on specific route, browser back works. 
                  */}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-white space-y-4">
            <div className="text-2xl font-bold opacity-50">Nenhum jogo disponível</div>
          </div>
        )}

        <div className="text-center space-y-6 animate-scale-in mt-12" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-white/90 backdrop-blur-sm bg-white/15 rounded-full px-4 py-2 inline-block border border-white/20">
            © 2025 Palpite Premiado. Todos os direitos reservados.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/admin/login"
              className="text-[10px] text-white/10 hover:text-white/50 transition-colors uppercase tracking-widest"
            >
              ADM
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
