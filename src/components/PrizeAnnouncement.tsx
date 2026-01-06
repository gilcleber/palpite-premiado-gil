
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

const PrizeAnnouncement = ({ matchId: propMatchId }: { matchId?: string }) => {
  const [settings, setSettings] = useState<PrizeSettings | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // New State
  const [extraPrizes, setExtraPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch latest match prizes
        let query = supabase.from("matches" as any).select("*");

        if (propMatchId) {
          query = query.eq('id', propMatchId);
        } else {
          query = query.eq('status', 'open').order('created_at', { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();

        if (error) throw error;

        // Type cast for safety
        const matchData = data as any;

        setSettings({
          prize_title: matchData.prize_title || "Prêmio Especial",
          prize_description: matchData.prize_description || "",
          prize_image_url: matchData.prize_image_url,
          prize_gallery: matchData.prize_gallery || [],
          draw_date: matchData.draw_date,
          team1_name: matchData.team_a_name,
          team2_name: matchData.team_b_name
        });

        // Init selected image
        if (matchData.prize_image_url) {
          setSelectedImage(matchData.prize_image_url);
        }

        // Fetch Extra Prizes (Global or Linked - for now Global/All)
        // Future: .eq('match_id', matchData.id)
        const { data: prizesData } = await supabase
          .from("prizes")
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
  }, [propMatchId]);

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
          <div className="flex flex-col items-center gap-6">

            {/* Text Section (Top) */}
            <div className="text-center space-y-4 max-w-2xl px-4">
              <h2 className="text-2xl font-bold text-[#1d244a] leading-tight drop-shadow-sm">
                {settings.prize_title || "Prêmio Especial"}
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {settings.prize_description || "Participe do nosso sorteio e concorra a prêmios incríveis!"}
              </p>

              <div className="flex items-center justify-center text-sm text-[#1d244a]/80 font-medium bg-blue-50/50 py-1.5 px-4 rounded-full inline-flex border border-blue-100">
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

            {/* Images Grid (Bottom - Side by Side) */}
            <div className="w-full flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">

                {/* Main Image */}
                {settings.prize_image_url && (
                  <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden shadow-md border-2 border-white ring-2 ring-[#d19563]/20 bg-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                      <img
                        src={settings.prize_image_url}
                        alt="Prêmio Principal"
                        className="w-full h-full object-contain"
                        onClick={() => setSelectedImage(settings.prize_image_url)}
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {settings.prize_gallery?.map((url, idx) => (
                  <div key={idx} className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden shadow-md border-2 border-white bg-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                    <img
                      src={url}
                      alt={`Foto ${idx}`}
                      className="w-full h-full object-contain"
                      onClick={() => setSelectedImage(url)}
                    />
                  </div>
                ))}

                {/* Fallback if no images */}
                {!settings.prize_image_url && (!settings.prize_gallery || settings.prize_gallery.length === 0) && (
                  <div className="w-32 h-32 bg-[#1d244a]/5 rounded-xl flex items-center justify-center">
                    <Gift className="h-12 w-12 text-[#1d244a]/20" />
                  </div>
                )}

              </div>
            </div>

            {/* Selected Image Modal/Overlay (Optional - simplified inline expansion if needed, but user just wanted them side by side) */}
            {/* Keeping it simple as requested: Just the grid view */}

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
