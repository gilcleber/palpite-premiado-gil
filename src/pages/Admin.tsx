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
  const { isAdmin, role, licenseExpired, loading } = useAuth(); // Added role, licenseExpired, loading
  const navigate = useNavigate(); // Keep navigate for potential future use, though not used in the provided snippet

  // console.log("Admin component - isAdmin:", isAdmin, "user:", !!user); // Removed, as user is not destructured from useAuth anymore

  // Removed handleLogout as it's not part of the new structure

  // FIX: Only show loading spinner if actually loading. 
  // If loading is false and role is null, we should fall through to "Acesso Negado".
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] to-[#2a3459]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Verificando permissões...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="text-center mt-20 text-white text-xl">Acesso Negado</div>; // Added text-white for visibility
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
          // Basic logout mock since useAuth.signOut is void
          window.location.href = '/';
        }}
      />
      <main className="container mx-auto py-8 px-4 animate-fade-in">
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 h-auto p-1 bg-white border shadow-sm rounded-xl"> {/* Adjusted grid-cols */}

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
            <ParticipantsList />
          </TabsContent>
          <TabsContent value="winners">
            <WinnerDraw />
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
