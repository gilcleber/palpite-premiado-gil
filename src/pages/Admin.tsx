
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import SettingsTab from "@/components/admin/SettingsTab";
import ParticipantsList from "@/components/admin/ParticipantsList";
import GameResultSelector from "@/components/admin/GameResultSelector";
import WinnerDraw from "@/components/admin/WinnerDraw";
import LiveDraw from "@/components/admin/LiveDraw";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'participants' | 'results' | 'winners' | 'live'>('settings');
  const { isAdmin, signOut, user, loading } = useAdminAuth();
  const navigate = useNavigate();

  console.log("Admin component - isAdmin:", isAdmin, "user:", !!user);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] to-[#2a3459]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d244a] to-[#2a3459] p-4">
      <div className="max-w-6xl mx-auto">
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'participants' && <ParticipantsList />}
        {activeTab === 'results' && <GameResultSelector />}
        {activeTab === 'winners' && <WinnerDraw />}
        {activeTab === 'live' && <LiveDraw />}
      </div>
    </div>
  );
};

export default Admin;
