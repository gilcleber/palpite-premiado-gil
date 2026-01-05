import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface AppSettings {
  id: string;
  prize_title: string;
  prize_description: string;
  prize_image_url: string | null;
  prize_gallery?: string[]; // New Gallery Field
  draw_date: string | null;
  team_a: string;
  team_b: string;
  team_a_logo_url: string | null;
  team_b_logo_url: string | null;
  radio_logo_url?: string | null;
  radio_slogan?: string | null;
}

interface Prize {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

const SettingsTab = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Extra Prizes State
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState<{ title: string; description: string; image_url: string | null }>({
    title: "",
    description: "",
    image_url: null
  });
  const [addingPrize, setAddingPrize] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading settings...");

        // Load App Settings
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();

        if (error) {
          console.error("Settings error:", error);
          if (error.code === 'PGRST116') {
            // ... existing default creation logic (omitted for brevity, assume usually exists)
          } else {
            throw error;
          }
        } else {
          // Cast to any to access new columns not yet in types
          const typedData = data as any;
          setSettings({
            id: typedData.id,
            prize_title: typedData.prize_title,
            prize_description: typedData.prize_description,
            prize_image_url: typedData.prize_image_url,
            prize_gallery: typedData.prize_gallery || [], // Load Gallery
            draw_date: typedData.draw_date,
            team_a: typedData.team_a || "Time A",
            team_b: typedData.team_b || "Time B",
            team_a_logo_url: typedData.team_a_logo_url,
            team_b_logo_url: typedData.team_b_logo_url,
            radio_logo_url: typedData.radio_logo_url,
            radio_slogan: typedData.radio_slogan || "",
          });
        }

        // Load Extra Prizes
        const { data: prizesData, error: prizesError } = await supabase
          .from("prizes")
          .select("*")
          .order("created_at", { ascending: true });

        if (prizesError) console.error("Error loading prizes:", prizesError);
        if (prizesData) setPrizes(prizesData);

      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleImageUpdate = (field: keyof AppSettings, url: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: url });
    }
  };

  // Gallery Handlers
  const handleAddGalleryImage = (url: string) => {
    if (settings) {
      const currentGallery = settings.prize_gallery || [];
      setSettings({ ...settings, prize_gallery: [...currentGallery, url] });
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (settings) {
      const currentGallery = settings.prize_gallery || [];
      const newGallery = currentGallery.filter((_, idx) => idx !== indexToRemove);
      setSettings({ ...settings, prize_gallery: newGallery });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      const updateData: any = {
        prize_title: settings.prize_title,
        prize_description: settings.prize_description,
        prize_image_url: settings.prize_image_url,
        prize_gallery: settings.prize_gallery, // Save Gallery
        draw_date: settings.draw_date,
        team_a: settings.team_a,
        team_b: settings.team_b,
        team_a_logo_url: settings.team_a_logo_url,
        team_b_logo_url: settings.team_b_logo_url,
        radio_logo_url: settings.radio_logo_url,
        radio_slogan: settings.radio_slogan,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("app_settings")
        .update(updateData)
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrize = async () => {
    if (!newPrize.title) {
      toast({ title: "Erro", description: "O título do prêmio é obrigatório.", variant: "destructive" });
      return;
    }
    setAddingPrize(true);
    try {
      const { data, error } = await supabase.from("prizes").insert([newPrize]).select().single();
      if (error) throw error;
      if (data) {
        setPrizes([...prizes, data as Prize]);
        setNewPrize({ title: "", description: "", image_url: null });
        toast({ title: "Prêmio Adicionado", description: "O novo prêmio foi salvo." });
      }
    } catch (err) {
      toast({ title: "Erro", description: "Erro ao adicionar prêmio.", variant: "destructive" });
    } finally {
      setAddingPrize(false);
    }
  };

  const handleDeletePrize = async (id: string) => {
    try {
      const { error } = await supabase.from("prizes").delete().eq("id", id);
      if (error) throw error;
      setPrizes(prizes.filter(p => p.id !== id));
      toast({ title: "Removido", description: "Prêmio removido com sucesso." });
    } catch (err) {
      toast({ title: "Erro", description: "Erro ao remover prêmio.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Game Settings at Top */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-fit">
        <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
          <CardTitle className="text-white">Configurações da Partida</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">

          {/* Teams Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-[#1d244a]">Time A (Mandante)</h4>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Time</label>
                <Input
                  name="team_a"
                  value={settings?.team_a || ""}
                  onChange={handleChange}
                  placeholder="Ex: Ponte Preta"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo do Time</label>
                <ImageUpload
                  onUploadComplete={(url) => handleImageUpdate('team_a_logo_url', url)}
                  currentImageUrl={settings?.team_a_logo_url}
                  onClear={() => handleImageUpdate('team_a_logo_url', '')}
                />
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-[#1d244a]">Time B (Visitante)</h4>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Time</label>
                <Input
                  name="team_b"
                  value={settings?.team_b || ""}
                  onChange={handleChange}
                  placeholder="Ex: Guarani"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo do Time</label>
                <ImageUpload
                  onUploadComplete={(url) => handleImageUpdate('team_b_logo_url', url)}
                  currentImageUrl={settings?.team_b_logo_url}
                  onClear={() => handleImageUpdate('team_b_logo_url', '')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <label htmlFor="draw_date_day" className="text-sm font-medium text-[#1d244a]">
                Data do Sorteio
              </label>
              <Input
                id="draw_date_day"
                type="date"
                value={settings?.draw_date ? new Date(settings.draw_date).toLocaleDateString('pt-BR').split('/').reverse().join('-') : ""}
                onChange={(e) => {
                  if (!settings) return;
                  const dateVal = e.target.value;
                  if (!dateVal) {
                    setSettings({ ...settings, draw_date: null });
                    return;
                  }
                  const currentDt = settings.draw_date ? new Date(settings.draw_date) : new Date();
                  const timeVal = settings.draw_date
                    ? `${String(currentDt.getHours()).padStart(2, '0')}:${String(currentDt.getMinutes()).padStart(2, '0')}`
                    : "19:00";
                  const newLocalIso = `${dateVal}T${timeVal}`;
                  setSettings({ ...settings, draw_date: new Date(newLocalIso).toISOString() });
                }}
                className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="draw_date_time" className="text-sm font-medium text-[#1d244a]">
                Horário
              </label>
              <Input
                id="draw_date_time"
                type="time"
                value={settings?.draw_date ? (() => {
                  const d = new Date(settings.draw_date);
                  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                })() : ""}
                onChange={(e) => {
                  if (!settings) return;
                  const timeVal = e.target.value;
                  if (!timeVal) return;
                  const datePart = settings.draw_date
                    ? new Date(settings.draw_date).toLocaleDateString('pt-BR').split('/').reverse().join('-')
                    : new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
                  const newLocalIso = `${datePart}T${timeVal}`;
                  setSettings({ ...settings, draw_date: new Date(newLocalIso).toISOString() });
                }}
                className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 bg-[#1d244a] hover:bg-[#2a3459] text-white border-0"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações do Jogo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* PRIZES MANAGEMENT CARD (Middle) */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-[#d19563] text-white rounded-t-lg">
          <CardTitle className="text-white">Gerenciar Prêmios</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">

          {/* Main Prize (from Settings) */}
          <div className="p-4 border-2 border-[#d19563]/20 rounded-xl bg-[#d19563]/5 relative">
            <div className="absolute top-0 right-0 bg-[#d19563] text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">
              PRINCIPAL (Salvo com Configurações)
            </div>
            <h3 className="font-bold text-lg text-[#d19563] mb-4">🏆 Prêmio Principal (Destaque)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  name="prize_title"
                  value={settings?.prize_title || ""}
                  onChange={handleChange}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  name="prize_description"
                  value={settings?.prize_description || ""}
                  onChange={handleChange}
                  rows={2}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem Principal (Capa)</label>
                <ImageUpload
                  onUploadComplete={(url) => handleImageUpdate('prize_image_url', url)}
                  currentImageUrl={settings?.prize_image_url}
                  onClear={() => handleImageUpdate('prize_image_url', '')}
                />
              </div>

              {/* Gallery Section */}
              <div className="space-y-2 pt-4 border-t border-[#d19563]/20">
                <label className="text-sm font-medium">Galeria de Fotos (Opcional - Mais ângulos do prêmio)</label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {settings?.prize_gallery?.map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border group">
                      <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 mb-2 text-center">Adicionar nova foto à galeria:</p>
                  <ImageUpload
                    label="Selecionar Foto Extra"
                    onUploadComplete={(url) => handleAddGalleryImage(url)}
                    // No current image url needed as this is an 'adder'
                    onClear={() => { }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Prizes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1d244a]">🎁 Prêmios Extras</h3>
            </div>

            {prizes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum prêmio extra cadastrado.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizes.map((prize) => (
                <div key={prize.id} className="relative group border rounded-lg p-3 bg-white hover:shadow-md transition-all">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" onClick={() => handleDeletePrize(prize.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-32 w-full bg-gray-100 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                    {prize.image_url ? (
                      <img src={prize.image_url} alt={prize.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs">Sem Imagem</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm truncate text-[#1d244a]" title={prize.title}>{prize.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{prize.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Prize */}
          <div className="p-4 border rounded-xl bg-gray-50 space-y-4">
            <h4 className="font-semibold text-sm text-gray-600">Adicionar Novo Prêmio à Lista</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Título do Prêmio (ex: Camisa Oficial)"
                  value={newPrize.title}
                  onChange={(e) => setNewPrize({ ...newPrize, title: e.target.value })}
                  className="bg-white"
                />
                <Textarea
                  placeholder="Descrição curta"
                  value={newPrize.description}
                  onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <ImageUpload
                  label="Imagem do Prêmio"
                  onUploadComplete={(url) => setNewPrize({ ...newPrize, image_url: url })}
                  currentImageUrl={newPrize.image_url}
                  onClear={() => setNewPrize({ ...newPrize, image_url: null })}
                />
              </div>
            </div>
            <Button onClick={handleAddPrize} disabled={addingPrize} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {addingPrize ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Adicionar Prêmio (Salva na hora)
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Radio Identity Section (Bottom) */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-fit">
        <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
          <CardTitle className="text-white">Identidade da Rádio (SaaS)</CardTitle>
          <p className="text-xs text-white/70">Configure aqui o logo e slogan que aparecem no rodapé e marca d'água.</p>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Logo da Rádio</label>
              <div className="mt-2">
                <ImageUpload
                  currentImageUrl={settings?.radio_logo_url}
                  onUploadComplete={(url) => handleImageUpdate('radio_logo_url', url)}
                  bucketName="images"
                  label="Logo da Rádio"
                  onClear={() => handleImageUpdate('radio_logo_url', '')}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="slogan">Slogan da Rádio</label>
              <Input
                id="slogan"
                name="radio_slogan"
                value={settings?.radio_slogan || ""}
                onChange={handleChange}
                placeholder="Ex: A rádio que fala com você!"
                className="bg-white mt-1 mb-4"
              />
              <p className="text-xs text-gray-500">
                O slogan aparece no rodapé e abaixo da marca d'água na página inicial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Save Action */}
      <div className="sticky bottom-4 z-50">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full shadow-2xl bg-[#1d244a] hover:bg-[#2a3459] text-white border-2 border-white/20 transform hover:scale-[1.01] transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando Tudo...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> SALVAR ALTERAÇÕES DO JOGO E PRÊMIO PRINCIPAL
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
