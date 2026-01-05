
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Calendar } from "lucide-react";

interface PrizeSettings {
  prize_title: string;
  prize_description: string;
  prize_image_url: string | null;
  prize_gallery?: string[]; // New
  draw_date: string | null;
  team1_name?: string;
  team2_name?: string;
}

const PrizeAnnouncement = () => {
  const [settings, setSettings] = useState<PrizeSettings | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // New State
  const [extraPrizes, setExtraPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();

        if (error) throw error;

        setSettings({
          ...data,
          prize_gallery: (data as any).prize_gallery || [],
          team1_name: (data as any).team_a || "Time A",
          team2_name: (data as any).team_b || "Time B"
        });

        // Init selected image
        if (data.prize_image_url) {
          setSelectedImage(data.prize_image_url);
        }

        const { data: prizesData, error: prizesError } = await supabase
          .from("prizes") // Types are now defined
          .select("*")
          .order("created_at", { ascending: true });

        if (prizesData) setExtraPrizes(prizesData);

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
    <div className="space-y-4">
      {/* Main Prize */}
      <Card className="mb-2 bg-gradient-to-r from-[#1d244a]/10 to-[#1d244a]/5 overflow-hidden border-blue-100/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">

            {/* Gallery / Main Image */}
            <div className="relative flex flex-col items-center">
              {settings.prize_image_url ? (
                <div className="space-y-2">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-xl overflow-hidden shadow-lg border-2 border-white ring-4 ring-[#d19563]/10 bg-white">
                    <img
                      src={selectedImage || settings.prize_image_url}
                      alt={settings.prize_title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Thumbnails */}
                  {(settings.prize_gallery && settings.prize_gallery.length > 0) && (
                    <div className="flex gap-2 flex-wrap max-w-[250px] justify-center pb-2">
                      <button
                        onClick={() => setSelectedImage(settings.prize_image_url)}
                        className={`w-12 h-12 rounded-md overflow-hidden border-2 flex-shrink-0 ${selectedImage === settings.prize_image_url ? 'border-[#d19563]' : 'border-transparent'}`}
                      >
                        <img src={settings.prize_image_url} className="w-full h-full object-cover" />
                      </button>
                      {settings.prize_gallery.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(url)}
                          className={`w-12 h-12 rounded-md overflow-hidden border-2 flex-shrink-0 ${selectedImage === url ? 'border-[#d19563]' : 'border-transparent'}`}
                        >
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 bg-[#1d244a]/10 rounded-full flex items-center justify-center">
                  <Gift className="h-10 w-10 text-[#1d244a]" />
                </div>
              )}
              <div className="absolute -top-3 -right-3 bg-[#d19563] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-bounce">
                DESTAQUE
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold text-[#1d244a] leading-tight">
                {settings.prize_title || "Prêmio Especial"}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {settings.prize_description || "Participe do nosso sorteio e concorra a prêmios incríveis!"}
              </p>
              <div className="flex items-center justify-center md:justify-start text-sm text-[#1d244a]/80 font-medium bg-blue-50/50 py-1 px-3 rounded-full inline-flex mt-2">
                <Calendar className="h-4 w-4 mr-2 text-[#d19563]" />
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

      {/* Extra Prizes Grid */}
      {extraPrizes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in">
          {extraPrizes.map((prize) => (
            <Card key={prize.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border">
                  {prize.image_url ? (
                    <img src={prize.image_url} alt={prize.title} className="w-full h-full object-contain" />
                  ) : (
                    <Gift className="h-6 w-6 text-gray-300 m-auto mt-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#1d244a] text-sm">{prize.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{prize.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrizeAnnouncement;
