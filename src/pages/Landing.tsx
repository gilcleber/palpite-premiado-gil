import { useState } from "react";
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
    MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        type: ""
    });
    const [loading, setLoading] = useState(false);

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
        { icon: Trophy, title: "Gestão de Jogos", desc: "Crie e gerencie palpites de forma simples" },
        { icon: Users, title: "Biblioteca de Times", desc: "Times pré-cadastrados e personalizáveis" },
        { icon: Zap, title: "Sorteio Automático", desc: "Sistema inteligente de sorteio" },
        { icon: BarChart3, title: "Painel Administrativo", desc: "Controle total em tempo real" },
        { icon: Smartphone, title: "Exportação Excel", desc: "Dados de participantes exportáveis" },
        { icon: MessageCircle, title: "Link Compartilhável", desc: "WhatsApp e Instagram integrados" },
        { icon: Palette, title: "Personalização Total", desc: "Sua marca, suas cores" },
        { icon: Shield, title: "Suporte Dedicado", desc: "Ajuda quando você precisar" }
    ];

    const plans = [
        {
            name: "Anual",
            price: "R$ 49,90",
            period: "à vista",
            features: ["Economia de 44%", "Todos os recursos", "Suporte prioritário"],
            highlight: true
        },
        {
            name: "Semestral",
            price: "R$ 69,90",
            period: "à vista",
            features: ["Economia de 22%", "Todos os recursos", "Suporte por email"]
        },
        {
            name: "Mensal",
            price: "R$ 89,90",
            period: "/mês",
            features: ["Sem compromisso", "Todos os recursos", "Cancele quando quiser"]
        }
    ];

    const faqs = [
        {
            q: "Como funciona o teste grátis?",
            a: "Você pode testar a plataforma por 7 dias sem compromisso. Não pedimos cartão de crédito."
        },
        {
            q: "Preciso de conhecimento técnico?",
            a: "Não! A plataforma é intuitiva e você configura tudo em minutos. Oferecemos suporte completo."
        },
        {
            q: "Posso cancelar a qualquer momento?",
            a: "Sim! Não há fidelidade. Você pode cancelar quando quiser."
        },
        {
            q: "Como personalizo minha marca?",
            a: "No painel administrativo você pode alterar logo, cores, nome e criar sua URL exclusiva."
        },
        {
            q: "Posso usar para outros esportes além de futebol?",
            a: "Sim! A plataforma funciona para qualquer esporte com times (basquete, vôlei, etc)."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d244a] via-[#2a3459] to-[#1d244a]">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Engaje Seu Público com<br />
                        <span className="text-[#d19563]">Palpites Premiados</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                        Plataforma completa para rádios e bares criarem promoções de palpites esportivos
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Button
                            size="lg"
                            className="bg-[#d19563] hover:bg-[#b8804f] text-white text-lg px-8 py-6"
                            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Solicitar Demonstração <ArrowRight className="ml-2" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                            onClick={() => window.open('https://wa.me/5519999999999', '_blank')}
                        >
                            <MessageCircle className="mr-2" /> Falar no WhatsApp
                        </Button>
                    </div>
                    <p className="text-white/60 text-sm">✨ Já usado por diversas rádios e bares pelo Brasil</p>
                </div>
            </section>

            {/* Problem/Solution */}
            <section className="py-16 px-4 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold text-[#d19563] mb-4">Difícil engajar seu público?</h3>
                            <ul className="space-y-3 text-white/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    <span>Ouvintes/clientes desinteressados</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    <span>Promoções complicadas de gerenciar</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    <span>Falta de ferramentas profissionais</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#d19563] mb-4">Sistema pronto, fácil e sem complicação!</h3>
                            <ul className="space-y-3 text-white/80">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                                    <span>Configure em minutos, sem programador</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                                    <span>Sorteios automáticos e transparentes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                                    <span>Sua marca, suas regras</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Por Que Escolher o Palpite Premiado?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-white/10 border-[#d19563]/30 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <Trophy className="w-16 h-16 text-[#d19563] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-3">Engajamento Garantido</h3>
                                <p className="text-white/70">Palpites interativos, prêmios personalizados e sorteios automáticos que mantêm seu público conectado.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-[#d19563]/30 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <Zap className="w-16 h-16 text-[#d19563] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-3">Fácil de Usar</h3>
                                <p className="text-white/70">Sem necessidade de programador. Configure em minutos com nosso painel intuitivo e suporte incluído.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-[#d19563]/30 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <Palette className="w-16 h-16 text-[#d19563] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-3">White Label</h3>
                                <p className="text-white/70">Logo da sua marca, cores personalizadas e URL exclusiva. O sistema é 100% seu!</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Como Funciona</h2>
                    <div className="space-y-6">
                        {[
                            { step: "1", title: "Cadastre-se", desc: "Crie sua conta em menos de 2 minutos" },
                            { step: "2", title: "Personalize", desc: "Adicione seu logo, cores e informações" },
                            { step: "3", title: "Crie Jogos", desc: "Configure palpites e prêmios" },
                            { step: "4", title: "Compartilhe", desc: "Envie o link para seu público (WhatsApp/Instagram)" },
                            { step: "5", title: "Sorteie", desc: "Sistema sorteia automaticamente os vencedores" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 bg-white/5 p-6 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-[#d19563] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                                    <p className="text-white/70">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Perfeito Para</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-400/30">
                            <CardContent className="p-8">
                                <Radio className="w-12 h-12 text-blue-400 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-4">Rádios</h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• Promoções durante programas esportivos</li>
                                    <li>• Engajamento nas redes sociais</li>
                                    <li>• Captação de leads (WhatsApp)</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-400/30">
                            <CardContent className="p-8">
                                <Beer className="w-12 h-12 text-orange-400 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-4">Bares</h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• Atrair clientes nos dias de jogo</li>
                                    <li>• Fidelização com prêmios</li>
                                    <li>• Divulgação nas redes</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-400/30">
                            <CardContent className="p-8">
                                <Instagram className="w-12 h-12 text-pink-400 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-4">Instagram</h3>
                                <ul className="space-y-2 text-white/80">
                                    <li>• Engajamento de seguidores</li>
                                    <li>• Promoções interativas</li>
                                    <li>• Crescimento orgânico</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Recursos Inclusos</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="text-center">
                                <feature.icon className="w-12 h-12 text-[#d19563] mx-auto mb-3" />
                                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-white/60">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-4">Planos e Preços</h2>
                    <p className="text-center text-white/70 mb-12">Parcelamento em até 3x sem juros no cartão</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <Card key={i} className={`${plan.highlight ? 'border-[#d19563] border-2 scale-105' : 'border-white/20'} bg-white/10 backdrop-blur-sm`}>
                                <CardContent className="p-8">
                                    {plan.highlight && (
                                        <div className="bg-[#d19563] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                            MAIS POPULAR
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-[#d19563]">{plan.price}</span>
                                        <span className="text-white/60 ml-2">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex items-center gap-2 text-white/80">
                                                <CheckCircle className="text-green-400 flex-shrink-0" size={18} />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-[#d19563] hover:bg-[#b8804f]' : 'bg-white/20 hover:bg-white/30'}`}
                                        onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Escolher Plano
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-white/10 rounded-lg p-6 cursor-pointer">
                                <summary className="font-bold text-white text-lg">{faq.q}</summary>
                                <p className="text-white/70 mt-3">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact-form" className="py-20 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="bg-white/10 border-[#d19563]/30 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <h2 className="text-3xl font-bold text-center text-white mb-2">Solicitar Demonstração</h2>
                            <p className="text-center text-white/70 mb-8">Preencha o formulário e entraremos em contato</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-white">Nome Completo</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/20 border-white/30 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white">Email</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white/20 border-white/30 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white">Telefone/WhatsApp</Label>
                                    <Input
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-white/20 border-white/30 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white">Tipo de Negócio</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="radio">Rádio</SelectItem>
                                            <SelectItem value="bar">Bar/Estabelecimento</SelectItem>
                                            <SelectItem value="instagram">Instagram/Influencer</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-[#d19563] hover:bg-[#b8804f] text-white text-lg py-6"
                                    disabled={loading}
                                >
                                    {loading ? "Enviando..." : "Solicitar Demonstração"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 bg-black/30 border-t border-white/10">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-white/60 mb-4">© 2026 Palpite Premiado. Todos os direitos reservados.</p>
                    <div className="flex justify-center gap-6 text-sm text-white/50">
                        <a href="#" className="hover:text-white/80">Sobre</a>
                        <a href="#" className="hover:text-white/80">Contato</a>
                        <a href="#" className="hover:text-white/80">Termos de Uso</a>
                        <a href="#" className="hover:text-white/80">Privacidade</a>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/5519999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl z-50 transition-transform hover:scale-110"
            >
                <MessageCircle size={32} />
            </a>
        </div>
    );
};

export default Landing;
