
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface AppSettings {
  id: string;
  prize_title: string;
  prize_description: string;
  prize_image_url: string | null;
  draw_date: string | null;
  team_a: string;
  team_b: string;
  team_a_logo_url: string | null;
  team_b_logo_url: string | null;
}

const SettingsTab = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading settings...");
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();

        if (error) {
          console.error("Settings error:", error);
          if (error.code === 'PGRST116') {
            const defaultSettings = {
              prize_title: "Prêmio do Sorteio",
              prize_description: "Descrição do prêmio aqui",
              prize_image_url: null,
              draw_date: null
            };

            const { data: newData, error: insertError } = await supabase
              .from("app_settings")
              .insert([defaultSettings])
              .select("*")
              .single();

            if (insertError) throw insertError;

            // Cast to any to access new columns not yet in types
            const typedNewData = newData as any;

            setSettings({
              id: typedNewData.id,
              prize_title: typedNewData.prize_title,
              prize_description: typedNewData.prize_description,
              prize_image_url: typedNewData.prize_image_url,
              draw_date: typedNewData.draw_date,
              team_a: "Time A",
              team_b: "Time B",
              team_a_logo_url: null,
              team_b_logo_url: null
            });
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
            draw_date: typedData.draw_date,
            team_a: "Time A",
            team_b: "Time B",
            team_a_logo_url: typedData.team_a_logo_url,
            team_b_logo_url: typedData.team_b_logo_url
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações",
          variant: "destructive",
        });
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

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      const updateData: any = {
        prize_title: settings.prize_title,
        prize_description: settings.prize_description,
        prize_image_url: settings.prize_image_url,
        draw_date: settings.draw_date,
        team_a_logo_url: settings.team_a_logo_url,
        team_b_logo_url: settings.team_b_logo_url,
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
        description: "Falha ao salvar. Verifique se você rodou a migração SQL.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-[#1d244a] text-white rounded-t-lg">
        <CardTitle className="text-white">Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {/* Teams Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="text-sm font-medium">URL do Logo (PNG/JPG)</label>
              <Input
                name="team_a_logo_url"
                value={settings?.team_a_logo_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-white"
              />
            </div>
            {settings?.team_a_logo_url && (
              <div className="mt-2 flex justify-center">
                <img src={settings.team_a_logo_url} alt="Logo Preview" className="h-16 w-16 object-contain" />
              </div>
            )}
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
              <label className="text-sm font-medium">URL do Logo (PNG/JPG)</label>
              <Input
                name="team_b_logo_url"
                value={settings?.team_b_logo_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-white"
              />
            </div>
            {settings?.team_b_logo_url && (
              <div className="mt-2 flex justify-center">
                <img src={settings.team_b_logo_url} alt="Logo Preview" className="h-16 w-16 object-contain" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="prize_title" className="text-sm font-medium text-[#1d244a]">
            Título do Prêmio
          </label>
          <Input
            id="prize_title"
            name="prize_title"
            value={settings?.prize_title || ""}
            onChange={handleChange}
            className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="prize_description" className="text-sm font-medium text-[#1d244a]">
            Descrição do Prêmio
          </label>
          <Textarea
            id="prize_description"
            name="prize_description"
            value={settings?.prize_description || ""}
            onChange={handleChange}
            rows={4}
            className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="prize_image_url" className="text-sm font-medium text-[#1d244a]">
            URL da Imagem do Prêmio
          </label>
          <Input
            id="prize_image_url"
            name="prize_image_url"
            value={settings?.prize_image_url || ""}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="draw_date_day" className="text-sm font-medium text-[#1d244a]">
              Data do Sorteio
            </label>
            <Input
              id="draw_date_day"
              type="date"
              value={settings?.draw_date ? new Date(settings.draw_date).toLocaleDateString('pt-BR').split('/').reverse().join('-') : ""} // Basic fallback, preferable to parse properly
              onChange={(e) => {
                if (!settings) return;
                const dateVal = e.target.value; // YYYY-MM-DD
                if (!dateVal) {
                  setSettings({ ...settings, draw_date: null });
                  return;
                }

                // Get current time or default to 19:00
                const currentDt = settings.draw_date ? new Date(settings.draw_date) : new Date();
                const timeVal = settings.draw_date
                  ? `${String(currentDt.getHours()).padStart(2, '0')}:${String(currentDt.getMinutes()).padStart(2, '0')}`
                  : "19:00";

                // Create new date object combining dateVal and timeVal (Local Time)
                // Note: new Date("YYYY-MM-DDTHH:mm") creates date in Local Time
                const newLocalIso = `${dateVal}T${timeVal}`;
                const newDateObj = new Date(newLocalIso);

                setSettings({ ...settings, draw_date: newDateObj.toISOString() });
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
                const timeVal = e.target.value; // HH:mm
                if (!timeVal) return;

                const currentDt = settings.draw_date ? new Date(settings.draw_date) : new Date();
                // If no date set yet, use today
                const datePart = settings.draw_date
                  ? new Date(settings.draw_date).toLocaleDateString('pt-BR').split('/').reverse().join('-')
                  : new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');

                const newLocalIso = `${datePart}T${timeVal}`;
                const newDateObj = new Date(newLocalIso);

                setSettings({ ...settings, draw_date: newDateObj.toISOString() });
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
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
