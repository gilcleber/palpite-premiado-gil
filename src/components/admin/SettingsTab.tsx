import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MatchEditor from "./MatchEditor";
import ImageUpload from "./ImageUpload";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

interface MatchSimple {
  id: string;
  team_a_name: string;
  team_b_name: string;
}

const SettingsTab = () => {
  const { tenant } = useTenant();
  const [matches, setMatches] = useState<MatchSimple[]>([]);
  const [activeTab, setActiveTab] = useState<string>("new");
  const [loading, setLoading] = useState(true);

  // Branding State
  const [branding, setBranding] = useState({
    primary_color: '#1d244a',
    secondary_color: '#d19563',
    site_title: '',
    logo_url: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant) {
      // Load Branding from Tenant (Unified Source)
      setBranding({
        primary_color: tenant.branding?.primary_color || '#1d244a',
        secondary_color: tenant.branding?.secondary_color || '#d19563',
        site_title: tenant.branding?.site_title || '',
        logo_url: tenant.branding?.logo_url || ''
      });

      fetchMatches();
    }
  }, [tenant]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches" as any)
      .select("id, team_a_name, team_b_name")
      .eq("tenant_id", tenant?.id)
      .order("created_at", { ascending: true });

    if (data) setMatches(data as any);
    setLoading(false);
  };

  const handleSaveBranding = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      const managerAuth = localStorage.getItem('palpite_manager_auth');
      if (!managerAuth) throw new Error("Sessão inválida");

      const session = JSON.parse(managerAuth);
      const pin = session.pin;

      if (!pin) {
        toast({ title: "Sessão Antiga", description: "Por favor, saia e entre novamente para salvar as alterações.", variant: "destructive" });
        setSaving(false);
        return;
      }

      // Preserve existing fields we don't edit here
      const newBranding = {
        ...tenant.branding,
        logo_url: branding.logo_url,
        site_title: branding.site_title,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
      };

      // Call RPC
      const { data, error } = await supabase.rpc('update_own_branding', {
        t_slug: tenant.slug,
        t_pin: pin,
        new_branding: newBranding
      });

      if (error) throw error;
      if (data !== true) throw new Error("PIN Incorreto ou Falha ao atualizar");

      toast({ title: "Sucesso!", description: "Identidade visual atualizada em todo o sistema." });

      // Delay reload to show toast
      setTimeout(() => window.location.reload(), 1500);

    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Erro ao salvar. Verifique se seu PIN mudou ou faça login novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER with TABS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1d244a]">Gerenciar Jogos</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
            {matches.map(m => (
              <TabsTrigger
                key={m.id}
                value={m.id}
                className="data-[state=active]:bg-[#1d244a] data-[state=active]:text-white border bg-gray-50 px-4 py-2 rounded-lg"
              >
                {m.team_a_name} x {m.team_b_name}
              </TabsTrigger>
            ))}

            <TabsTrigger
              value="new"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white border border-green-200 bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg ml-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> ADICIONAR NOVO JOGO
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {activeTab === 'new' ? (
              <MatchEditor
                matchId={null}
                onSaveSuccess={(newId) => {
                  fetchMatches().then(() => {
                    if (newId) setActiveTab(newId);
                  });
                }}
              />
            ) : (
              <MatchEditor
                key={activeTab}
                matchId={activeTab}
                onSaveSuccess={() => {
                  fetchMatches();
                }}
              />
            )}
          </div>
        </Tabs>
      </div>

      {/* UNIFIED BRANDING SECTION */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center"><Settings2 className="mr-2" /> Identidade Visual (Global)</CardTitle>
          <p className="text-xs text-white/70">Alterações aqui refletem imediatamente no site e no painel Master.</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Column 1: Images & Text */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Logo da Rádio (Transparente)</label>
                <ImageUpload
                  bucketName="images"
                  currentImageUrl={branding.logo_url}
                  onUploadComplete={url => setBranding(prev => ({ ...prev, logo_url: url }))}
                  onClear={() => setBranding(prev => ({ ...prev, logo_url: '' }))}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Nome / Slogan</label>
                <Input
                  value={branding.site_title}
                  onChange={e => setBranding({ ...branding, site_title: e.target.value })}
                  placeholder="Ex: Rádio Educadora - A Melhor!"
                />
              </div>
            </div>

            {/* Column 2: Colors */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Cores do Tema</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Cor Primária (Fundo)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primary_color}
                      onChange={e => setBranding({ ...branding, primary_color: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-gray-200 p-1 bg-white"
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={e => setBranding({ ...branding, primary_color: e.target.value })}
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Cor Secundária (Destaques)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondary_color}
                      onChange={e => setBranding({ ...branding, secondary_color: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-gray-200 p-1 bg-white"
                    />
                    <Input
                      value={branding.secondary_color}
                      onChange={e => setBranding({ ...branding, secondary_color: e.target.value })}
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Small */}
              <div className="mt-4 p-4 rounded-lg text-center text-white text-sm font-bold shadow-lg transition-colors duration-500"
                style={{ backgroundColor: branding.primary_color }}>
                Preview do Botão
                <button className="block mx-auto mt-2 px-4 py-1 rounded text-white shadow" style={{ backgroundColor: branding.secondary_color }}>
                  Ação Principal
                </button>
                <span className="block mt-2 text-xs opacity-70" style={{ color: branding.secondary_color }}>Texto de Destaque</span>
              </div>
            </div>

          </div>

          <Button
            onClick={handleSaveBranding}
            disabled={saving}
            className="w-full h-12 text-lg font-bold shadow-lg"
            style={{ backgroundColor: branding.secondary_color }}
          >
            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            SALVAR ALTERAÇÕES
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
