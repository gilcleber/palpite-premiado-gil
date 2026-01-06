import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import ImageUpload from "./ImageUpload";
import MatchList from "./MatchList";
import MatchEditor from "./MatchEditor";

const SettingsTab = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Global Radio Settings State
  const [globalSettings, setGlobalSettings] = useState<{ id: string, radio_logo_url: string | null, radio_slogan: string | null } | null>(null);
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Load Global Settings (Radio Identity)
  useEffect(() => {
    const fetchGlobal = async () => {
      const { data } = await supabase.from("app_settings").select("id, radio_logo_url, radio_slogan").single();
      if (data) setGlobalSettings(data as any);
    };
    fetchGlobal();
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
    if (!error) toast({ title: "Salvo", description: "Identidade da Rádio atualizada." });
    else toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
  };

  // View Handlers
  const handleCreate = () => {
    setSelectedMatchId(null);
    setView('create');
  };

  const handleEdit = (id: string) => {
    setSelectedMatchId(id);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setSelectedMatchId(null);
  };

  // Renders
  if (view === 'create' || view === 'edit') {
    return <MatchEditor matchId={selectedMatchId} onBack={handleBack} onSave={handleBack} />;
  }

  return (
    <div className="space-y-8">
      {/* Global Identity Section */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
          <CardTitle className="text-white">Identidade da Rádio (Global)</CardTitle>
          <p className="text-xs text-white/70">Logo e slogan que aparecem em todos os jogos.</p>
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

      {/* Matches List */}
      <MatchList onCreate={handleCreate} onEdit={handleEdit} />
    </div>
  );
};

export default SettingsTab;
