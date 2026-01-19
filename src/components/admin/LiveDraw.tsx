import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle, Instagram, Phone, Eye, EyeOff, Award, Users, Download, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

type Palpite = {
    id: string;
    nome_completo: string;
    instagram_handle: string | null;
    cidade: string;
    placar_time_a: number;
    placar_time_b: number;
    time_a: string;
    time_b: string;
    telefone: string;
    cpf: string;
    escolha: string;
};

const LiveDraw = ({ matchId }: { matchId?: string | null }) => {
    const [candidates, setCandidates] = useState<Palpite[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [winner, setWinner] = useState<Palpite | null>(null);
    const [gameResult, setGameResult] = useState({ a: 0, b: 0 });
    const [teamNames, setTeamNames] = useState({ a: "", b: "" });
    const [displayIndex, setDisplayIndex] = useState(0);
    const [showFullPhone, setShowFullPhone] = useState(false);
    const [drawMode, setDrawMode] = useState<'correct' | 'all'>('correct');
    const [previousWinnerIds, setPreviousWinnerIds] = useState<string[]>([]);

    // Ref for the specific card element we want to capture
    const winnerCardRef = useRef<HTMLDivElement>(null);

    // Load official result from Database
    useEffect(() => {
        const fetchOfficialResult = async () => {
            if (matchId) {
                const { data } = await supabase
                    .from('matches' as any)
                    .select('score_team_a, score_team_b, team_a_name, team_b_name')
                    .eq('id', matchId)
                    .single();

                if (data) {
                    const d = data as any;
                    setGameResult({
                        a: d.score_team_a || 0,
                        b: d.score_team_b || 0
                    });
                    setTeamNames({
                        a: d.team_a_name || "Time A",
                        b: d.team_b_name || "Time B"
                    });
                }
            } else {
                // Fallback to app_settings (legacy or default)
                const { data } = await supabase
                    .from('app_settings')
                    .select('score_team_a, score_team_b')
                    .single();

                if (data) {
                    setGameResult({
                        a: data.score_team_a || 0,
                        b: data.score_team_b || 0
                    });
                    setTeamNames({ a: "Time A", b: "Time B" });
                }
            }
        };

        fetchOfficialResult();

        // Subscribe to real-time updates
        const table = matchId ? 'matches' : 'app_settings';
        const filter = matchId ? `id=eq.${matchId}` : undefined;

        const channel = supabase
            .channel('public:live_draw_updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, (payload) => {
                const newData = payload.new as any;
                if (newData) {
                    setGameResult({
                        a: newData.score_team_a || 0,
                        b: newData.score_team_b || 0
                    });
                    if (newData.team_a_name) {
                        setTeamNames({
                            a: newData.team_a_name,
                            b: newData.team_b_name
                        });
                    }
                    toast.info("Resultado oficial atualizado!");
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    // NEW: Load Previous Winners to filter them out
    const loadPreviousWinners = async () => {
        if (!matchId) return [];
        try {
            const { data, error } = await supabase
                .from('winners' as any)
                .select('participant_id')
                .eq('match_id', matchId);

            if (error) throw error;

            const ids = data.map((w: any) => w.participant_id);
            setPreviousWinnerIds(ids);
            return ids;
        } catch (err) {
            console.error("Error loading previous winners:", err);
            return [];
        }
    };

    // Load winners when component mounts or matchId changes
    useEffect(() => {
        loadPreviousWinners();
    }, [matchId]);

    const fetchCandidates = async () => {
        setLoading(true);
        setWinner(null);
        try {
            console.log(`Searching candidates. Mode: ${drawMode}`);

            // Reload excluded IDs to be sure
            const currentWinnerIds = await loadPreviousWinners();

            let query = supabase
                .from("palpites")
                .select("*");

            if (matchId) {
                query = query.eq('match_id', matchId);
            }

            // Apply filter if in 'correct' mode
            if (drawMode === 'correct') {
                query = query
                    .eq("placar_time_a", gameResult.a)
                    .eq("placar_time_b", gameResult.b);
            }

            const { data, error } = await query;

            if (error) throw error;

            console.log("Found:", data);

            // Filter out existing winners
            let filteredData = (data as unknown as Palpite[]);
            if (currentWinnerIds.length > 0) {
                filteredData = filteredData.filter(p => !currentWinnerIds.includes(p.id));
            }

            // Cast to ensure type safety
            setCandidates(filteredData);

            if (filteredData.length === 0) {
                toast.info(drawMode === 'correct'
                    ? `Nenhum acertador DISPONÍVEL para o placar ${gameResult.a}x${gameResult.b} (vencedores anteriores excluídos)`
                    : "Nenhum participante disponível (todos já ganharam ou lista vazia)."
                );
            } else {
                toast.success(`${filteredData.length} participantes aptos para sorteio!`);
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Erro ao buscar participantes.");
        } finally {
            setLoading(false);
        }
    };

    const saveWinnerToDB = async (winner: Palpite) => {
        if (!matchId) return;
        try {
            const { error } = await supabase
                .from('winners' as any)
                .insert({
                    match_id: matchId,
                    participant_id: winner.id,
                    prize_claimed: false
                } as any);

            if (error) throw error;

            toast.success("Ganhador salvo!", { description: "Registrado no histórico com sucesso." });

            // Update local exclusion list immediately
            setPreviousWinnerIds(prev => [...prev, winner.id]);

        } catch (err) {
            console.error("Error saving winner:", err);
            // Don't show error toast here to not interrupt flow, seeing as it's a background action
        }
    };

    const startDraw = () => {
        if (candidates.length === 0) return;
        setDrawing(true);
        setWinner(null);
        setShowFullPhone(false); // Reset privacy

        // Animation loop
        let duration = 3000; // 3 seconds shuffle
        let interval = 50;
        let startTime = Date.now();

        const shuffleInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const randomIdx = Math.floor(Math.random() * candidates.length);
            setDisplayIndex(randomIdx);

            if (elapsedTime > duration) {
                clearInterval(shuffleInterval);
                // Pick Winner (Double Check Exclusion!)
                const finalCandidates = candidates.filter(c => !previousWinnerIds.includes(c.id));

                if (finalCandidates.length === 0) {
                    setDrawing(false);
                    toast.error("Todos os participantes listados já ganharam!");
                    return;
                }

                const finalWinnerIndex = Math.floor(Math.random() * finalCandidates.length);
                const selectedWinner = finalCandidates[finalWinnerIndex];

                setWinner(selectedWinner);
                setDisplayIndex(finalWinnerIndex); // Visual only, index might mismatch but name will be correct
                setDrawing(false);

                // Save to DB!
                saveWinnerToDB(selectedWinner);

                // Celebration
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#d19563', '#1d244a', '#ffffff'] // Theme colors confetti
                });
            }
        }, interval);
    };

    const maskPhone = (phone: string) => {
        if (!phone) return "No Phone";
        // Remove non-digits
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length < 10) return phone; // Too short to mask properly

        // Format: (XX) XXXXX-XXXX
        // We want to hide the last 4 digits: (XX) XXXXX-****
        const ddd = cleaned.slice(0, 2);
        const prefix = cleaned.slice(2, 7); // 5 digits
        const suffix = cleaned.slice(7);    // 4 digits (to hide)

        return `(${ddd}) ${prefix}-****`;
    };

    const formatFullPhone = (phone: string) => {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    }

    const getTranslatedChoice = (choice: string) => {
        if (choice === 'draw') return 'Empate';
        if (choice === 'team1') return teamNames.a;
        if (choice === 'team2') return teamNames.b;
        return choice;
    };

    // Download Card Function
    const handleDownloadCard = async () => {
        if (!winnerCardRef.current || !winner) return;

        try {
            const canvas = await html2canvas(winnerCardRef.current, {
                backgroundColor: null,
                scale: 2, // Higher resolution
                logging: false,
                useCORS: true // Important for images
            });

            const link = document.createElement('a');
            link.download = `vencedor_${winner.nome_completo.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success("Imagem baixada com sucesso!");
        } catch (error) {
            console.error("Error downloading card:", error);
            toast.error("Erro ao gerar imagem para download.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 min-h-[600px] flex flex-col items-center">

            {/* Header for vMix/Streaming */}
            <div className="w-full text-center mb-10">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d19563] to-amber-200 uppercase tracking-widest drop-shadow-sm">
                    Sorteio Oficial
                </h2>
                <p className="text-slate-400 mt-2 text-lg">Palpite Premiado</p>
                {matchId && (
                    <div className="mt-4 text-2xl text-white font-bold bg-white/10 px-6 py-2 rounded-full inline-block border border-white/10">
                        {teamNames.a} <span className="text-[#d19563] mx-2">x</span> {teamNames.b}
                    </div>
                )}
            </div>

            {!winner && !drawing && (
                <div className="w-full mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-white text-lg mb-4 text-center">Configurar Resultado da Partida</h3>
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <input
                            type="number"
                            value={gameResult.a}
                            onChange={(e) => setGameResult({ ...gameResult, a: parseInt(e.target.value) || 0 })}
                            className="w-16 h-16 text-3xl text-center bg-slate-900 text-white rounded-lg border-2 border-[#d19563] focus:outline-none focus:ring-4 focus:ring-[#d19563]/50"
                        />
                        <span className="text-4xl text-white font-bold">X</span>
                        <input
                            type="number"
                            value={gameResult.b}
                            onChange={(e) => setGameResult({ ...gameResult, b: parseInt(e.target.value) || 0 })}
                            className="w-16 h-16 text-3xl text-center bg-slate-900 text-white rounded-lg border-2 border-[#d19563] focus:outline-none focus:ring-4 focus:ring-[#d19563]/50"
                        />
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center gap-4 mb-6">
                        <Button
                            variant={drawMode === 'correct' ? 'default' : 'outline'}
                            onClick={() => { setDrawMode('correct'); setCandidates([]); }}
                            className={`min-w-[180px] ${drawMode === 'correct' ? 'bg-[#d19563] hover:bg-[#b07b4e] text-white' : 'text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                        >
                            <Award className="w-4 h-4 mr-2" />
                            Acertadores
                        </Button>
                        <Button
                            variant={drawMode === 'all' ? 'default' : 'outline'}
                            onClick={() => { setDrawMode('all'); setCandidates([]); }}
                            className={`min-w-[180px] ${drawMode === 'all' ? 'bg-[#d19563] hover:bg-[#b07b4e] text-white' : 'text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Todos Participantes
                        </Button>
                    </div>

                    <div className="text-center">
                        <Button onClick={fetchCandidates} className="bg-[#d19563] hover:bg-[#b07b4e] text-white px-8 py-2 text-lg font-bold w-full max-w-md">
                            {drawMode === 'correct' ? 'Buscar Acertadores' : 'Buscar Todos Participantes'}
                        </Button>
                        <p className="text-slate-500 text-sm mt-2">
                            {drawMode === 'correct' ? `Filtrando por placar exato: ${gameResult.a}x${gameResult.b}` : "Sorteio entre todos os participantes registrados"}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Display Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">

                {/* Counter Badge */}
                {candidates.length > 0 && !winner && (
                    <div className="absolute -top-12 right-0 bg-[#d19563]/10 text-[#d19563] px-6 py-2 rounded-full border border-[#d19563]/30 text-base font-bold shadow-lg backdrop-blur-sm z-10 animate-fade-in">
                        {candidates.length} Participantes
                    </div>
                )}

                {/* The Card / Name Display - Ref added here for capture */}
                <div
                    ref={winnerCardRef}
                    className="relative w-full max-w-2xl aspect-video bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(209,149,99,0.3)] flex items-center justify-center transform transition-all duration-300"
                >
                    {candidates.length > 0 ? (
                        <div className="text-center p-8 w-full animate-fade-in">
                            {winner ? (
                                <div className="animate-scale-in flex flex-col items-center">
                                    <Trophy className="w-24 h-24 text-[#d19563] mb-4 drop-shadow-md animate-bounce" />
                                    <h3 className="text-2xl text-slate-500 font-bold mb-2">VENCEDOR(A)</h3>
                                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-2 break-words">
                                        {winner.nome_completo.split(' ')[0]}
                                    </h1>
                                    <h2 className="text-3xl text-slate-700 font-bold mb-4">
                                        {winner.nome_completo.split(' ').slice(1).join(' ')}
                                    </h2>

                                    {/* Hide these details when capturing/downloading if privacy needed? 
                                        Actually, usually winner cards for social media want the name big and maybe city.
                                        We'll capture exactly what is shown.
                                    */}

                                    <div className="flex flex-col gap-3 min-w-[300px]">
                                        {/* Instagram */}
                                        <div className="flex items-center justify-center gap-3 text-xl text-[#1d244a] font-semibold bg-gray-100 py-2 px-6 rounded-full w-full">
                                            <Instagram className="w-6 h-6" />
                                            {winner.instagram_handle || "Sem Instagram"}
                                        </div>

                                        {/* Phone Number with Toggle */}
                                        <div className="flex items-center justify-center gap-3 text-xl text-gray-600 font-semibold bg-gray-100 py-2 px-6 rounded-full w-full relative group">
                                            <Phone className="w-6 h-6" />
                                            <span>
                                                {showFullPhone
                                                    ? formatFullPhone(winner.telefone)
                                                    : maskPhone(winner.telefone)
                                                }
                                            </span>

                                            {/* Privacy Toggle Button - Hide from capture using data-html2canvas-ignore if needed, but button is small enough */}
                                            <button
                                                onClick={() => setShowFullPhone(!showFullPhone)}
                                                className="absolute right-3 p-1 hover:bg-gray-300 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title={showFullPhone ? "Ocultar" : "Mostrar Completo"}
                                                data-html2canvas-ignore
                                            >
                                                {showFullPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {/* Choice Display (Translated) */}
                                        <div className="text-slate-500 text-sm mt-2">
                                            Palpite: {winner.placar_time_a}x{winner.placar_time_b} ({getTranslatedChoice(winner.escolha)})
                                        </div>
                                    </div>

                                    <p className="mt-4 text-slate-400 font-medium">{winner.cidade}</p>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-800 mb-4 transition-all">
                                        {drawing ? (candidates[displayIndex] ? candidates[displayIndex].nome_completo : "...") : "Preparado?"}
                                    </h2>
                                    {drawing && (
                                        <p className="text-xl text-slate-500 animate-pulse">Sorteando...</p>
                                    )}
                                    {!drawing && (
                                        <p className="text-slate-400 text-xl">Clique em sortear para descobrir o ganhador</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-center">
                            <p className="text-xl">
                                {loading ? "Buscando..." : "Aguardando busca de participantes..."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full mt-10 h-24 flex items-center justify-center gap-4">
                {candidates.length > 0 && !drawing && !winner && (
                    <Button
                        onClick={startDraw}
                        className="bg-gradient-to-r from-[#d19563] to-[#b8835a] hover:from-[#c28452] hover:to-[#a76f47] text-white text-3xl font-black py-8 px-16 rounded-full shadow-[0_10px_30px_rgba(209,149,99,0.4)] transform hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                    >
                        <Shuffle className="w-8 h-8" /> SORTEAR
                    </Button>
                )}
                {winner && (
                    <div className="flex gap-4">
                        <Button
                            onClick={() => { setWinner(null); setDrawing(false); setShowFullPhone(false); }}
                            className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold py-6 px-10 rounded-xl"
                        >
                            Novo Sorteio
                        </Button>

                        {/* Download Image Button */}
                        <Button
                            onClick={handleDownloadCard}
                            className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-6 px-6 rounded-xl flex items-center gap-2"
                            title="Baixar imagem do card"
                        >
                            <Download className="w-6 h-6" />
                            <span className="hidden sm:inline">Baixar Imagem</span>
                        </Button>

                        {/* Admin Only - Copy Full Data */}
                        <Button
                            onClick={() => {
                                const fullInfo = `Vencedor: ${winner.nome_completo}\nCPF: ${winner.cpf}\nCidade: ${winner.cidade}\nTel: ${winner.telefone}\nInsta: ${winner.instagram_handle}`;
                                navigator.clipboard.writeText(fullInfo);
                                toast.success("Dados do vencedor copiados!");
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-6 px-6 rounded-xl"
                            title="Copiar dados complestos"
                        >
                            Copiar Dados
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LiveDraw;
