
import { Shield, Settings, Filter, SortDesc, LogOut, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  activeTab: 'settings' | 'participants' | 'results' | 'winners' | 'live';
  setActiveTab: (tab: 'settings' | 'participants' | 'results' | 'winners' | 'live') => void;
  onLogout: () => void;
}

const AdminHeader = ({ activeTab, setActiveTab, onLogout }: AdminHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center">
        <Shield className="h-8 w-8 text-[#d19563] mr-3" />
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
      </div>
      <div className="flex flex-wrap gap-2 justify-center md:justify-end">
        <Button
          variant={activeTab === 'settings' ? "default" : "outline"}
          onClick={() => setActiveTab('settings')}
          className={activeTab === 'settings' ?
            "bg-[#d19563] text-white hover:bg-[#b8835a] border-0" :
            "border-[#d19563] text-[#d19563] bg-transparent hover:bg-[#d19563] hover:text-white"}
        >
          <Settings className="h-4 w-4 mr-2" />
          Config
        </Button>
        <Button
          variant={activeTab === 'participants' ? "default" : "outline"}
          onClick={() => setActiveTab('participants')}
          className={activeTab === 'participants' ?
            "bg-[#d19563] text-white hover:bg-[#b8835a] border-0" :
            "border-[#d19563] text-[#d19563] bg-transparent hover:bg-[#d19563] hover:text-white"}
        >
          <Filter className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button
          variant={activeTab === 'results' ? "default" : "outline"}
          onClick={() => setActiveTab('results')}
          className={activeTab === 'results' ?
            "bg-[#d19563] text-white hover:bg-[#b8835a] border-0" :
            "border-[#d19563] text-[#d19563] bg-transparent hover:bg-[#d19563] hover:text-white"}
        >
          <SortDesc className="h-4 w-4 mr-2" />
          Resultado
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open('#/admin/live-draw', 'LiveDraw', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no')}
          className="border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          LIVE vMix (Popup)
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.hash = "/"}
          className="border-blue-300 text-blue-300 bg-transparent hover:bg-blue-300 hover:text-[#1d244a]"
        >
          <Home className="h-4 w-4 mr-2" />
          Site
        </Button>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-red-400 text-red-400 bg-transparent hover:bg-red-400 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
