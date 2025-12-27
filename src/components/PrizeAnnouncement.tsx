
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Calendar } from "lucide-react";

interface PrizeSettings {
  prize_title: string;
  prize_description: string;
  prize_image_url: string | null;
  draw_date: string | null;
  team1_name?: string; // Made optional
  team2_name?: string; // Made optional
}

const PrizeAnnouncement = () => {
  const [settings, setSettings] = useState<PrizeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();

        if (error) throw error;

        // Add default team names since they don't exist in the database
        const updatedData = {
          ...data,
          team1_name: "Ponte Preta", // Default value
          team2_name: "Guarani" // Default value
        };

        setSettings(updatedData);
      } catch (error) {
        console.error("Error fetching prize settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-[#1d244a]/10 to-[#1d244a]/5">
        <CardContent className="p-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-[#1d244a]/10 to-[#1d244a]/5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {settings.prize_image_url ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={settings.prize_image_url}
                alt={settings.prize_title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-[#1d244a]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gift className="h-12 w-12 text-[#1d244a]" />
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-[#1d244a] mb-2">
              {settings.prize_title || "Prêmio Especial"}
            </h2>
            <p className="text-gray-700 mb-2">
              {settings.prize_description || "Participe do nosso sorteio e concorra a prêmios incríveis!"}
            </p>
            <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Sorteio: {settings.draw_date ? new Date(settings.draw_date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "Data a ser definida"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeAnnouncement;
