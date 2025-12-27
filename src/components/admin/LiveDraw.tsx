import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle, Instagram } from "lucide-react";
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
};

const LiveDraw = () => {
    const [candidates, setCandidates] = useState<Palpite[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [winner, setWinner] = useState<Palpite | null>(null);
    const [gameResult, setGameResult] = useState({ a: 0, b: 0 });
    const [displayIndex, setDisplayIndex] = useState(0);

    // Fetch candidates who guessed the exact score
    const fetchEligibleCandidates = async () => {
        setLoading(true);
        setWinner(null);
        try {
            // Get candidates matching the manual score input
            // In a real scenario, you might want to fetch 'gameResult' from settings or input it here.
            // For now, let's allow admin to input the result to filter.

            const { data, error } = await supabase
                .from("palpites")
                .select("*")
                .eq("placar_time_a", gameResult.a)
                .eq("placar_time_b", gameResult.b);

            if (error) throw error;

            setCandidates(data as Palpite[]);
            if (data.length === 0) {
                toast.info("Nenhum acertador para este placar (ainda).");
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
                    colors: ['#2563EB', '#FBBF24', '#ffffff']
                });

                // Play sound effect? (Browser policy might block autoplay)
            }
        }, interval);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 min-h-[600px] flex flex-col items-center">

            {/* Header for vMix/Streaming */}
            <div className="w-full text-center mb-10">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest drop-shadow-sm">
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
                            className="w-16 h-16 text-3xl text-center bg-slate-900 text-white rounded-lg border-2 border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                        />
                        <span className="text-4xl text-white font-bold">X</span>
                        <input
                            type="number"
                            value={gameResult.b}
                            onChange={(e) => setGameResult({ ...gameResult, b: parseInt(e.target.value) || 0 })}
                            className="w-16 h-16 text-3xl text-center bg-slate-900 text-white rounded-lg border-2 border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="text-center mt-6">
                        <Button onClick={fetchEligibleCandidates} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-lg font-bold">
                            Buscar Acertadores
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Display Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">

                {/* Counter Badge */}
                {candidates.length > 0 && !winner && (
                    <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-4 py-1 rounded-full border border-green-500/50 text-sm font-bold">
                        {candidates.length} Participantes
                    </div>
                )}

                {/* The Card / Name Display */}
                <div className="relative w-full max-w-2xl aspect-video bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.3)] flex items-center justify-center transform transition-all duration-300">
                    {candidates.length > 0 ? (
                        <div className="text-center p-8 w-full animate-fade-in">
                            {winner ? (
                                <div className="animate-scale-in">
                                    <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-6 drop-shadow-md animate-bounce" />
                                    <h3 className="text-2xl text-slate-500 font-bold mb-2">VENCEDOR(A)</h3>
                                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-4 break-words">
                                        {winner.nome_completo.split(' ')[0]}
                                    </h1>
                                    <h2 className="text-3xl text-slate-700 font-bold mb-6">
                                        {winner.nome_completo.split(' ').slice(1).join(' ')}
                                    </h2>
                                    <div className="flex items-center justify-center gap-3 text-2xl text-blue-600 font-semibold bg-blue-50 py-2 px-6 rounded-full inline-flex">
                                        <Instagram className="w-8 h-8" />
                                        {winner.instagram_handle || "Sem Instagram"}
                                    </div>
                                    <p className="mt-4 text-slate-400 font-medium">{winner.cidade}</p>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-800 mb-4 transition-all">
                                        {drawing ? candidates[displayIndex]?.nome_completo : "Preparado?"}
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
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-3xl font-black py-8 px-16 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] transform hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                    >
                        <Shuffle className="w-8 h-8" /> SORTEAR
                    </Button>
                )}
                {winner && (
                    <Button
                        onClick={() => { setWinner(null); setDrawing(false); }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold py-6 px-10 rounded-xl"
                    >
                        Novo Sorteio
                    </Button>
                )}
            </div>

        </div>
    );
};

export default LiveDraw;
