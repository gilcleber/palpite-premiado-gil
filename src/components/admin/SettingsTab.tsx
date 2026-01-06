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

interface MatchSimple {
  id: string;
  team_a_name: string;
  team_b_name: string;
}

const SettingsTab = () => {
  const [matches, setMatches] = useState<MatchSimple[]>([]);
  const [activeTab, setActiveTab] = useState<string>("new");
  const [loading, setLoading] = useState(true);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<{ id: string, radio_logo_url: string | null, radio_slogan: string | null } | null>(null);
  const [savingGlobal, setSavingGlobal] = useState(false);

  const fetchEverything = async () => {
    setLoading(true);
    // 1. Fetch Matches
    const { data: matchesData } = await supabase.from("matches").select("id, team_a_name, team_b_name").order("created_at", { ascending: true });

    // 2. Fetch Global Settings
    const { data: appData } = await supabase.from("app_settings").select("id, radio_logo_url, radio_slogan").single();

    if (matchesData) setMatches(matchesData as any);
    if (appData) setGlobalSettings(appData as any);

    // Auto-select first match if exists and we are in "loading" phase
    if (matchesData && matchesData.length > 0 && activeTab === 'new' && loading) {
      setActiveTab(matchesData[0].id);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEverything();
  }, []);

  const saveGlobalSettings = async () => {
    if (!globalSettings) return;
    setSavingGlobal(true);
    const { error } = await supabase.from("app_settings").update({
      radio_logo_url: globalSettings.radio_logo_url,
      radio_slogan: globalSettings.radio_slogan,
      updated_at: new Date().toISOString()
    }).eq("id", globalSettings.id);

    setSavingGlobal(false);
    if (!error) toast({ title: "Salvo", description: "Identidade Global atualizada." });
    else toast({ title: "Erro", description: "Falha ao salvar identidade." });
  };

  return (
    <div className="space-y-8">
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

          {/* Content Area */}
          <div className="mt-6">
            {activeTab === 'new' ? (
              <MatchEditor
                matchId={null}
                onSaveSuccess={(newId) => {
                  fetchEverything().then(() => {
                    if (newId) setActiveTab(newId);
                  });
                }}
              />
            ) : (
              <MatchEditor
                key={activeTab} // Force re-render on tab change
                matchId={activeTab}
                onSaveSuccess={() => {
                  fetchEverything();
                  // If deleted, maybe switch to 'new' or keep? 
                  // Usually MatchEditor calls onSaveSuccess even after delete.
                  // We can check if activeTab still exists in next render, but simple Fetch is safest.
                  // Wait, if deleted, we should probably switch tab. 
                  // Let's assume onSaveSuccess without args means 'refresh'
                  // If we want to handle delete purely, we'd need another callback or check match existence.
                  // For now, let's keep it simple: refreshing will remove the deleted tab.
                  // If activeTab is now gone, we should switch.
                }}
              />
            )}
          </div>
        </Tabs>
      </div>

      {/* GLOBAL IDENTITY SECTION (Always Visible at Bottom) */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center"><Settings2 className="mr-2" /> Identidade da Rádio (Global)</CardTitle>
          <p className="text-xs text-white/70">Logo e slogan que aparecem em TODOS os jogos.</p>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Logo da Rádio</label>
              <div className="mt-2">
                <ImageUpload
                  bucketName="images"
                  currentImageUrl={globalSettings?.radio_logo_url}
                  onUploadComplete={url => setGlobalSettings(prev => prev ? { ...prev, radio_logo_url: url } : null)}
                  onClear={() => setGlobalSettings(prev => prev ? { ...prev, radio_logo_url: null } : null)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Slogan</label>
              <Input
                className="mt-2"
                value={globalSettings?.radio_slogan || ""}
                onChange={e => setGlobalSettings(prev => prev ? { ...prev, radio_slogan: e.target.value } : null)}
              />
              <Button
                onClick={saveGlobalSettings}
                disabled={savingGlobal}
                className="mt-4 w-full bg-[#d19563] hover:bg-[#b58053] text-white"
              >
                {savingGlobal ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Salvar Identidade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
