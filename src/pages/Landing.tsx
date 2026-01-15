import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    CheckCircle,
    Zap,
    Palette,
    Users,
    Trophy,
    BarChart3,
    Smartphone,
    Shield,
    Radio,
    Beer,
    Instagram,
    ArrowRight,
    MessageCircle,
    Mic,
    Newspaper,
    Building2,
    Gamepad2
} from "lucide-react";

const Landing = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        type: ""
    });
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        // Simple intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-4', 'duration-700');
                    entry.target.classList.remove('opacity-0', 'translate-y-4');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("leads" as any)
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    type: formData.type,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            toast.success("Solicitação enviada! Entraremos em contato em breve.");
            setFormData({ name: "", email: "", phone: "", type: "" });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Trophy, title: "Gestão Completa", desc: "Crie bolões e palpites em segundos" },
        { icon: Users, title: "Base de Times", desc: "Milhares de escudos e times prontos" },
        { icon: Zap, title: "Sorteio Automático", desc: "IA define os vencedores sem erro" },
        { icon: BarChart3, title: "Dashboard Real", desc: "Acompanhe engajamento ao vivo" },
        { icon: Smartphone, title: "Mobile First", desc: "Perfeito em qualquer celular" },
        { icon: MessageCircle, title: "Viralização", desc: "Integração nativa com WhatsApp" },
        { icon: Palette, title: "White Label", desc: "Sua marca, suas cores, seu domínio" },
        { icon: Shield, title: "Segurança", desc: "Proteção total dos dados" }
    ];

    const plans = [
        {
            name: "Starter",
            price: "R$ 49,90",
            period: "à vista",
            desc: "Ideal para começar",
            features: ["Até 2 jogos simultâneos", "Personalização básica", "Suporte por email"],
            highlight: false
        },
        {
            name: "Pro",
            price: "R$ 69,90",
            period: "à vista",
            desc: "O favorito dos criadores",
            features: ["Jogos ilimitados", "Personalização total", "Suporte prioritário", "Remoção de branding"],
            highlight: true
        },
        {
            name: "Business",
            price: "R$ 89,90",
            period: "/mês",
            desc: "Para máxima escala",
            features: ["Tudo do Pro", "API de integração", "Gerente de conta", "Múltiplos usuários"],
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-purple-500 selection:text-white">
            {/* Navbar flutuante simples */}
            <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        PALPITE PREMIADO
                    </span>
                    <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Começar Agora
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

                <div className="max-w-6xl mx-auto text-center reveal opacity-0 translate-y-4">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-purple-300">
                        🚀 A plataforma #1 de engajamento esportivo
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Transforme Torcedores em<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                            Clientes Fiéis
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A ferramenta definitiva para Rádios, Influencers e Empresas criarem bolões interativos e capturarem leads qualificados.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Criar Meu Bolão <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/5 text-lg px-8 py-6 h-auto backdrop-blur-sm"
                            onClick={() => window.open('https://wa.me/5519991511288', '_blank')}
                        >
                            <MessageCircle className="mr-2 w-5 h-5 text-green-400" /> Falar com Consultor
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats/Social Proof */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal opacity-0 translate-y-4">
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">10k+</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider">Palpites/Mês</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">500+</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider">Prêmios Entregues</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">98%</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider">Satisfação</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">24/7</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider">Suporte</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases - Expandido */}
            <section className="py-24 px-4 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 reveal opacity-0 translate-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Para quem é o Palpite Premiado?</h2>
                        <p className="text-slate-400">Soluções personalizadas para cada tipo de negócio</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 reveal opacity-0 translate-y-4">
                        {/* Rádios & Mídia */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300">
                                    <Radio size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Rádios & Canais de TV</h3>
                                <p className="text-slate-400 mb-4">Mantenha a audiência sintonizada. Crie palpites sobre os jogos da rodada e sorteie prêmios ao vivo.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Aumento de retenção</li>
                                    <li className="flex items-center gap-2">✓ Merchandising digital</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Creators */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-pink-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-6 text-pink-400 group-hover:text-pink-300">
                                    <Mic size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Podcasts & Influencers</h3>
                                <p className="text-slate-400 mb-4">Engaje sua comunidade. Crie ligas exclusivas para seus seguidores ou membros de canais VIP.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Gamificação da audiência</li>
                                    <li className="flex items-center gap-2">✓ Monetização com sponsors</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Bares */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-6 text-yellow-400 group-hover:text-yellow-300">
                                    <Beer size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Sports Bars & Pubs</h3>
                                <p className="text-slate-400 mb-4">Lote a casa em dias de jogo. Quem acerta o placar ganha um chopp ou desconto na conta.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Casa cheia quarta e domingo</li>
                                    <li className="flex items-center gap-2">✓ Fidelização de clientes</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Empresas */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300">
                                    <Building2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Endomarketing</h3>
                                <p className="text-slate-400 mb-4">Bolão da firma profissional. Melhore o clima organizacional e integração entre equipes.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Team building divertido</li>
                                    <li className="flex items-center gap-2">✓ Baixo custo de implementação</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Portais */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-green-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6 text-green-400 group-hover:text-green-300">
                                    <Newspaper size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Portais de Notícias</h3>
                                <p className="text-slate-400 mb-4">Aumente o tempo de página e recorrência. Widgets de palpites direto nas matérias esportivas.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Novos inventários de anúncio</li>
                                    <li className="flex items-center gap-2">✓ Coleta de dados (First-party)</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Times Amadores */}
                        <Card className="bg-[#1e293b] border-white/5 hover:border-red-500/50 transition-all hover:-translate-y-1 group">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6 text-red-400 group-hover:text-red-300">
                                    <Gamepad2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Várzea & Amador</h3>
                                <p className="text-slate-400 mb-4">Engaje a torcida do bairro. Ação entre amigos digital e profissionalizada.</p>
                                <ul className="text-sm text-slate-500 space-y-2">
                                    <li className="flex items-center gap-2">✓ Arrecadação de fundos</li>
                                    <li className="flex items-center gap-2">✓ Comunidade ativa</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing - Design Moderno com Cartões Glassmorphism */}
            <section className="py-24 px-4 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-fixed bg-center relative group">
                <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <h2 className="text-4xl font-bold text-center text-white mb-4 reveal opacity-0 translate-y-4">Planos Flexíveis</h2>
                    <p className="text-center text-slate-300 mb-12 reveal opacity-0 translate-y-4">Escolha a melhor opção para o seu momento</p>

                    <div className="grid md:grid-cols-3 gap-8 reveal opacity-0 translate-y-4">
                        {plans.map((plan, i) => (
                            <div key={i} className={`relative rounded-2xl p-8 backdrop-blur-md border transition-all duration-300 hover:-translate-y-2 ${plan.highlight
                                    ? 'bg-white/10 border-purple-500 shadow-2xl shadow-purple-900/40'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        MAIS POPULAR
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400 ml-2 text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-3 text-slate-300 text-sm">
                                            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-purple-400' : 'text-slate-500'}`} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full h-12 rounded-xl text-base font-medium transition-all ${plan.highlight
                                            ? 'bg-white text-purple-900 hover:bg-slate-100'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Selecionar {plan.name}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section className="py-24 px-4 bg-[#0f172a]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Dúvidas Frequentes</h2>
                    <div className="space-y-4 reveal opacity-0 translate-y-4">
                        {/* FAQs - Conteúdo igual, só visual novo */}
                        {[
                            { q: "Preciso pagar para testar?", a: "Não! Oferecemos 7 dias totalmente grátis para você conhecer a plataforma." },
                            { q: "Posso colocar minha logo?", a: "sim! O sistema é White Label. Você personaliza logo, cores e textos para ficar com a cara da sua marca." },
                            { q: "Como recebo o dinheiro dos bolões?", a: "Você define as regras. A plataforma gerencia os palpites, você gerencia a premiação diretamente com seu público." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-[#1e293b] rounded-xl overflow-hidden border border-white/5 open:border-purple-500/30 transition-all">
                                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-white select-none group-hover:text-purple-300 transition-colors">
                                    {faq.q}
                                    <span className="text-2xl transition-transform group-open:rotate-45 text-purple-500">+</span>
                                </summary>
                                <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Elegante */}
            <section id="contact-form" className="py-24 px-4 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
                <div className="max-w-4xl mx-auto bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl reveal opacity-0 translate-y-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Vamos Impulsionar seu Engajamento?</h2>
                        <p className="text-slate-400">Preencha o formulário abaixo para agendar uma demonstração gratuita.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Nome Completo</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-[#0f172a] border-white/10 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20"
                                placeholder="Ex: João Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Email Corporativo</Label>
                            <Input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-[#0f172a] border-white/10 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20"
                                placeholder="joao@empresa.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">WhatsApp</Label>
                            <Input
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-[#0f172a] border-white/10 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Segmento</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="bg-[#0f172a] border-white/10 text-white h-12">
                                    <SelectValue placeholder="Selecione seu segmento" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                                    <SelectItem value="radio">Rádio / TV</SelectItem>
                                    <SelectItem value="creator">Influencer / Podcaster</SelectItem>
                                    <SelectItem value="bar">Bar / Eventos</SelectItem>
                                    <SelectItem value="company">Empresa (Endomarketing)</SelectItem>
                                    <SelectItem value="news">Portal de Notícias</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            className="md:col-span-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg h-14 rounded-xl shadow-lg shadow-purple-500/25 mt-4 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? "Enviando seus dados..." : "Solicitar Contato Especialista"}
                        </Button>
                        <p className="md:col-span-2 text-center text-xs text-slate-500 mt-4">
                            Ao enviar, você concorda com nossos termos de privacidade. Seus dados estão seguros.
                        </p>
                    </form>
                </div>
            </section>

            {/* Footer Minimalista */}
            <footer className="py-12 px-4 bg-[#0f172a] border-t border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for tech stack or partner logos if needed */}
                    <span className="text-2xl font-bold text-white tracking-widest">PALPITE PREMIADO</span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 mb-8">
                    <a href="#" className="hover:text-purple-400 transition-colors">Sobre Nós</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Cases de Sucesso</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Blog</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Termos</a>
                </div>
                <div className="text-slate-600 text-sm">
                    © 2026 Palpite Premiado SaaS. Todos os direitos reservados.
                    <div className="mt-2">
                        <a href="/super" className="text-purple-900/40 hover:text-purple-500/60 transition-colors text-xs">
                            Admin Acess
                        </a>
                    </div>
                </div>
            </footer>

            {/* Floating Action Button */}
            <a
                href="https://wa.me/5519991511288"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-2xl z-50 transition-all hover:scale-110 hover:rotate-12 group"
            >
                <MessageCircle size={28} className="group-hover:animate-pulse" />
            </a>
        </div>
    );
};

export default Landing;
