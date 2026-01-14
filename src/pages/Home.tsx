import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d244a] via-[#2a3459] to-[#1d244a] flex items-center justify-center p-4">
            <div className="text-center">
                {/* Logo/Title */}
                <h1 className="text-8xl md:text-9xl font-bold text-white mb-8 tracking-tight">
                    PALPITE
                    <br />
                    <span className="text-[#d19563]">PREMIADO</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/60 mb-12">
                    Sistema de Palpites Esportivos
                </p>

                {/* Quick Access Links */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/super')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
                    >
                        Acesso Admin
                    </button>
                    <button
                        onClick={() => navigate('/lp')}
                        className="px-6 py-3 bg-[#d19563] hover:bg-[#b8804f] text-white rounded-lg transition-all"
                    >
                        Saiba Mais
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-16 text-white/30 text-sm">
                    © 2026 Palpite Premiado
                </div>
            </div>
        </div>
    );
};

export default Home;
