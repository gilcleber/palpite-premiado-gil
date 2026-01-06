import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle, Instagram, Phone, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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
};

const LiveDraw = ({ matchId }: { matchId?: string | null }) => {
    const [candidates, setCandidates] = useState<Palpite[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [winner, setWinner] = useState<Palpite | null>(null);
    const [gameResult, setGameResult] = useState({ a: 0, b: 0 });
    const [displayIndex, setDisplayIndex] = useState(0);
    const [showFullPhone, setShowFullPhone] = useState(false);

    // Load official result from Database
    useEffect(() => {
        const fetchOfficialResult = async () => {
            if (matchId) {
                const { data } = await supabase
                    .from('matches' as any)
                    .select('score_team_a, score_team_b')
                    .eq('id', matchId)
                    .single();

                if (data) {
                    const d = data as any;
                    setGameResult({
                        a: d.score_team_a || 0,
                        b: d.score_team_b || 0
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
                    toast.info("Resultado oficial atualizado!");
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    const fetchEligibleCandidates = async () => {
        setLoading(true);
        setWinner(null);
        try {
            console.log(`Searching for: ${gameResult.a}x${gameResult.b}`);

            let query = supabase
                .from("palpites")
                .select("*")
                .eq("placar_time_a", gameResult.a)
                .eq("placar_time_b", gameResult.b);

            if (matchId) {
                query = query.eq('match_id', matchId);
            }

            const { data, error } = await query;

            if (error) throw error;

            console.log("Found:", data);

            // Cast to ensure telefone is included (it might be missing in old records?)
            setCandidates(data as unknown as Palpite[]);
            if (data.length === 0) {
                toast.info(`Nenhum acertador para o placar ${gameResult.a}x${gameResult.b}`);
            } else {
                toast.success(`${data.length} acertadores encontrados!`);
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Erro ao buscar acertadores.");
        } finally {
            setLoading(false);
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
                // Pick Winner
                const finalWinnerIndex = Math.floor(Math.random() * candidates.length);
                const selectedWinner = candidates[finalWinnerIndex];
                setWinner(selectedWinner);
                setDisplayIndex(finalWinnerIndex);
                setDrawing(false);

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

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 min-h-[600px] flex flex-col items-center">

            {/* Header for vMix/Streaming */}
            <div className="w-full text-center mb-10">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d19563] to-amber-200 uppercase tracking-widest drop-shadow-sm">
                    Sorteio Oficial
                </h2>
                <p className="text-slate-400 mt-2 text-lg">Palpite Premiado</p>
            </div>

            {!winner && !drawing && (
                <div className="w-full mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-white text-lg mb-4 text-center">Configurar Resultado da Partida</h3>
                    <div className="flex justify-center items-center gap-4">
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
                    <div className="text-center mt-6">
                        <Button onClick={fetchEligibleCandidates} className="bg-[#d19563] hover:bg-[#b07b4e] text-white px-8 py-2 text-lg font-bold">
                            Buscar Acertadores
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Display Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">

                {/* Counter Badge */}
                {/* Counter Badge - Moved up and styled to match theme */}
                {candidates.length > 0 && !winner && (
                    <div className="absolute -top-12 right-0 bg-[#d19563]/10 text-[#d19563] px-6 py-2 rounded-full border border-[#d19563]/30 text-base font-bold shadow-lg backdrop-blur-sm z-10 animate-fade-in">
                        {candidates.length} Participantes
                    </div>
                )}

                {/* The Card / Name Display */}
                <div className="relative w-full max-w-2xl aspect-video bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(209,149,99,0.3)] flex items-center justify-center transform transition-all duration-300">
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

                                            {/* Privacy Toggle Button - Only visible on hover/focus to not clutter stream if possible, or small */}
                                            <button
                                                onClick={() => setShowFullPhone(!showFullPhone)}
                                                className="absolute right-3 p-1 hover:bg-gray-300 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title={showFullPhone ? "Ocultar" : "Mostrar Completo"}
                                            >
                                                {showFullPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
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
                            <p className="text-xl">Aguardando busca de participantes...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full mt-10 h-24 flex items-center justify-center">
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
