import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom"; // Keep useNavigate for potential future use or if it's implicitly used elsewhere
import { Loader2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticipantsList from "@/components/admin/ParticipantsList";
import SettingsTab from "@/components/admin/SettingsTab";
import WinnerDraw from "@/components/admin/WinnerDraw";
import LicenseManager from "@/components/admin/LicenseManager";
import { useAuth } from "@/hooks/useAuth"; // Changed from useAdminAuth

const Admin = () => {
  const { isAdmin, role, licenseExpired, loading } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase.from("matches" as any).select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const allMatches = data as any[];
      setMatches(allMatches);
      if (!selectedMatchId) setSelectedMatchId(allMatches[0].id);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] to-[#2a3459]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Verificando permissões...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="text-center mt-20 text-white text-xl">Acesso Negado</div>;
  }

  if (licenseExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <div className="text-red-500 mb-4 mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Licença Expirada</h1>
          <p className="text-gray-600 mb-6">
            O período de validade da sua licença encerrou. <br />
            Entre em contato com o administrador para renovar.
          </p>
          <div className="text-sm text-gray-400">
            Se você é o dono, contate o suporte.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        activeTab="settings"
        setActiveTab={() => { }}
        onLogout={async () => {
          window.location.href = '/';
        }}
        selectedMatchId={selectedMatchId}
      />

      {/* GLOBAL GAME SELECTOR */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Gerenciando Jogo:</span>
            <select
              className="bg-[#1d244a] text-white px-4 py-2 rounded-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm shadow-md transition-all hover:bg-[#2a3459]"
              value={selectedMatchId || ""}
              onChange={(e) => setSelectedMatchId(e.target.value)}
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.team_a_name} x {m.team_b_name}
                </option>
              ))}
              {matches.length === 0 && <option value="">Nenhum jogo criado</option>}
            </select>
          </div>
          {selectedMatchId && (
            <div className="text-xs text-gray-400">
              ID: {selectedMatchId.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto py-8 px-4 animate-fade-in">
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 h-auto p-1 bg-white border shadow-sm rounded-xl">
            <TabsTrigger value="participants" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              👥 Participantes
            </TabsTrigger>
            <TabsTrigger value="winners" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              🏆 Sorteio
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              ⚙️ Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="outline-none">
            <ParticipantsList matchId={selectedMatchId} />
          </TabsContent>
          <TabsContent value="winners">
            <WinnerDraw matchId={selectedMatchId} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
