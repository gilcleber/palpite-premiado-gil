import { useNavigate } from "react-router-dom";
import { ArrowRight, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";

const Home = () => {
    const navigate = useNavigate();
    const [clickCount, setClickCount] = useState(0);

    // Reset clicks if user stops clicking for 2 seconds
    useEffect(() => {
        if (clickCount === 0) return;

        const timer = setTimeout(() => {
            setClickCount(0);
        }, 2000);

        return () => clearTimeout(timer);
    }, [clickCount]);

    const handleSecretAccess = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 3) {
            navigate('/super');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients from Landing */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            <div className="text-center relative z-10 max-w-2xl mx-auto">
                <div
                    className="inline-block mb-8 p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl cursor-pointer select-none active:scale-95 transition-transform"
                    onClick={handleSecretAccess}
                    title="Palpite Premiado"
                >
                    {/* Logo/Title */}
                    <h1 className="text-6xl md:text-8xl font-black mb-2 tracking-tighter">
                        <span className="text-white">PALPITE</span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                            PREMIADO
                        </span>
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light">
                    Transformando a paixão pelo esporte em <br />
                    <strong className="text-white font-semibold">engajamento real.</strong>
                </p>

                {/* Quick Access Links */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 w-full sm:w-auto hover:border-purple-500/50"
                    >
                        <UserCircle size={20} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
                        <span>Área do Assinante</span>
                    </button>
                    <button
                        onClick={() => navigate('/lp')}
                        className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 w-full sm:w-auto hover:scale-105"
                    >
                        <span>Conhecer a Plataforma</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-20 text-slate-600 text-sm">
                    © 2026 Palpite Premiado • Todos os direitos reservados
                </div>
            </div>
        </div>
    );
};

export default Home;
