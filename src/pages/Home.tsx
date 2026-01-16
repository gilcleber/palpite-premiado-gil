import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
    const navigate = useNavigate();
    const [clickCount, setClickCount] = useState(0);

    const handleSecretAccess = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 5) {
            navigate('/super');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>

            <div className="text-center relative z-10 max-w-2xl mx-auto">
                {/* Logo - clickable for secret access */}
                <div
                    onClick={handleSecretAccess}
                    className="cursor-default select-none"
                >
                    <h1 className="text-7xl md:text-9xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-pulse">
                        PALPITE
                    </h1>
                    <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-purple-400 text-transparent bg-clip-text animate-pulse">
                        PREMIADO
                    </h1>
                </div>

                {/* Subtle hint for secret access (only visible after 3 clicks) */}
                {clickCount >= 3 && clickCount < 5 && (
                    <p className="mt-8 text-gray-500 text-sm animate-fade-in">
                        {5 - clickCount} {5 - clickCount === 1 ? 'clique' : 'cliques'} restante{5 - clickCount === 1 ? '' : 's'}...
                    </p>
                )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl"></div>
        </div>
    );
};

export default Home;
