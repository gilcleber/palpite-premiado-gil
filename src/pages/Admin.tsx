import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParticipantsList from "@/components/admin/ParticipantsList";
import SettingsTab from "@/components/admin/SettingsTab";
import WinnerDraw from "@/components/admin/WinnerDraw";
import LicenseManager from "@/components/admin/LicenseManager";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import ChangePinModal from "@/components/admin/ChangePinModal";

const TeamLibrary = lazy(() => import("@/components/admin/TeamLibrary"));
const WinnersTab = lazy(() => import("@/components/admin/WinnersTab"));

const Admin = () => {
  const { isAdmin, role, licenseExpired, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Check Manager Token (Silent Auth for PIN) - useMemo ensures this recalculates when tenant loads
  const isManager = useMemo(() => {
    if (!tenant) return false;
    try {
      const stored = localStorage.getItem('palpite_manager_auth');
      if (!stored) return false;
      const data = JSON.parse(stored);
      return data.tenant_id === tenant.id && data.role === 'manager';
    } catch (e) { return false; }
  }, [tenant]);

  const isAuthorized = isAdmin || isManager;

  useEffect(() => {
    if (tenant) {
      fetchMatches();
    }
  }, [tenant]);

  const navigate = useNavigate(); // Ensure this is used

  // If not authorized and fully loaded, redirect to login
  useEffect(() => {
    if (!isAuthorized && !authLoading && !tenantLoading) {
      // Optional: Auto-redirect if unauthorized, instead of showing "Access Denied" loop.
      // For now, checks are strict. If users prefer "Access Denied" screen, keep it, but fixing the link is critical.
      const slugParam = tenant?.slug ? `?tenant=${tenant.slug}` : '';
      // navigate(`/login${slugParam}`); // Uncomment to auto-redirect
    }
  }, [isAuthorized, authLoading, tenantLoading, tenant, navigate]);

  // ... (fetchMatches logic)
  const fetchMatches = async () => {
    if (!tenant) return;
    const { data } = await supabase
      .from("matches" as any)
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    if (data) {
      const allMatches = data as any[];
      setMatches(allMatches);
      if (data.length > 0 && !selectedMatchId) {
        setSelectedMatchId(allMatches[0].id);
      } else if (data.length === 0) {
        setSelectedMatchId(null);
      }
    }
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] to-[#2a3459]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Carregando painel...</span>
      </div>
    );
  }

  // Extra safety: only show "Access Denied" if tenant is loaded AND user is not authorized
  // This prevents race condition where tenantLoading=false but tenant hasn't propagated to useMemo
  if (!isAuthorized && tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-[#0f172a]">
        <div className="text-center text-white text-xl font-bold">Acesso Negado</div>
        <p className="text-gray-400">Você não tem permissão para gerenciar esta rádio.</p>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => navigate(`/login${tenant?.slug ? `?tenant=${tenant.slug}` : ''}`)}
        >
          Ir para Login
        </Button>
      </div>
    );
  }

  if (licenseExpired && !isAdmin) { // Admins can ignore expirations to fix them
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

            {selectedMatchId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const match = matches.find(m => m.id === selectedMatchId);
                  if (!match) return;

                  const newVisible = !match.visible;
                  // Optimistic update
                  setMatches(matches.map(m => m.id === selectedMatchId ? { ...m, visible: newVisible } : m));

                  const { error } = await supabase
                    .from('matches' as any)
                    .update({ visible: newVisible })
                    .eq('id', selectedMatchId);

                  if (error) {
                    console.error("Error toggling visibility:", error);
                    // Revert on error
                    setMatches(matches.map(m => m.id === selectedMatchId ? { ...m, visible: match.visible } : m));
                  }
                }}
                className={matches.find(m => m.id === selectedMatchId)?.visible ? "text-green-600" : "text-gray-400"}
                title={matches.find(m => m.id === selectedMatchId)?.visible ? "Jogo Visível (Clique para ocultar)" : "Jogo Oculto (Clique para mostrar)"}
              >
                {matches.find(m => m.id === selectedMatchId)?.visible ? (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded-md border border-green-200">
                    <span className="text-xs font-bold">ON</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md border border-gray-200">
                    <span className="text-xs font-bold">OFF</span>
                  </div>
                )}
              </Button>
            )}
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5 h-auto p-1 bg-white border shadow-sm rounded-xl">
            <TabsTrigger value="participants" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              👥 Participantes
            </TabsTrigger>
            <TabsTrigger value="winners" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              🏆 Sorteio
            </TabsTrigger>
            <TabsTrigger value="teams" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              🛡️ Times
            </TabsTrigger>
            <TabsTrigger value="history" className="py-3 data-[state=active]:bg-[#1d244a] data-[state=active]:text-white rounded-lg transition-all">
              📋 Ganhadores
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
          <TabsContent value="teams">
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#1d244a]" /></div>}>
              <TeamLibrary />
            </Suspense>
          </TabsContent>
          <TabsContent value="history">
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#1d244a]" /></div>}>
              <WinnersTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      {isManager && tenant?.manager_pin === '1234' && (
        <ChangePinModal
          tenantSlug={tenant.slug}
          currentPin="1234"
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default Admin;
