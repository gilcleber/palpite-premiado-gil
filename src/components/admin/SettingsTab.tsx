
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
          // Se não existir configuração, criar uma padrão
          if (error.code === 'PGRST116') {
            console.log("No settings found, creating default...");
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
              
            if (insertError) {
              console.error("Error creating default settings:", insertError);
              throw insertError;
            }
            
            setSettings({
              id: newData.id,
              prize_title: newData.prize_title,
              prize_description: newData.prize_description,
              prize_image_url: newData.prize_image_url,
              draw_date: newData.draw_date,
              team_a: "Time A", // Valor padrão local
              team_b: "Time B"  // Valor padrão local
            });
          } else {
            throw error;
          }
        } else {
          console.log("Settings loaded:", data);
          setSettings({
            id: data.id,
            prize_title: data.prize_title,
            prize_description: data.prize_description,
            prize_image_url: data.prize_image_url,
            draw_date: data.draw_date,
            team_a: "Time A", // Valor padrão local
            team_b: "Time B"  // Valor padrão local
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
    console.log("Field changed:", name, value);
    if (settings) {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      console.log("Saving settings:", settings);
      
      // Salvamos apenas os campos que existem na tabela
      const { error } = await supabase
        .from("app_settings")
        .update({
          prize_title: settings.prize_title,
          prize_description: settings.prize_description,
          prize_image_url: settings.prize_image_url,
          draw_date: settings.draw_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (error) {
        console.error("Save error:", error);
        throw error;
      }
      
      console.log("Settings saved successfully");
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro", 
        description: "Não foi possível salvar as configurações. Verifique a conexão com o Supabase.",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="team_a" className="text-sm font-medium text-[#1d244a]">
              Time A
            </label>
            <Input
              id="team_a"
              name="team_a"
              value={settings?.team_a || ""}
              onChange={handleChange}
              placeholder="Nome do Time A"
              className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
            />
            <p className="text-xs text-gray-500">
              Nota: Os nomes dos times são armazenados localmente e precisam ser configurados no banco de dados.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="team_b" className="text-sm font-medium text-[#1d244a]">
              Time B
            </label>
            <Input
              id="team_b"
              name="team_b"
              value={settings?.team_b || ""}
              onChange={handleChange}
              placeholder="Nome do Time B"
              className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
            />
            <p className="text-xs text-gray-500">
              Nota: Os nomes dos times são armazenados localmente e precisam ser configurados no banco de dados.
            </p>
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

        <div className="space-y-2">
          <label htmlFor="draw_date" className="text-sm font-medium text-[#1d244a]">
            Data do Sorteio
          </label>
          <Input
            id="draw_date"
            name="draw_date"
            type="datetime-local"
            value={settings?.draw_date ? new Date(settings.draw_date).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            className="border-gray-300 focus:border-[#1d244a] focus:ring-[#1d244a]/20"
          />
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
