
import { Shield, Settings, Filter, SortDesc, LogOut, ExternalLink, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";

interface AdminHeaderProps {
  activeTab: 'settings' | 'participants' | 'winners' | 'live';
  setActiveTab: (tab: 'settings' | 'participants' | 'winners' | 'live') => void;
  onLogout: () => void;
  selectedMatchId?: string | null;
}

const AdminHeader = ({ activeTab, setActiveTab, onLogout, selectedMatchId }: AdminHeaderProps) => {
  const { tenant } = useTenant();
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center">
        <Shield className="h-8 w-8 text-[#d19563] mr-3" />
        <h1 className="text-2xl font-bold text-[#1d244a]">Painel Administrativo</h1>
      </div>
      <div className="flex flex-wrap gap-2 justify-center md:justify-end">

        {/* Removed redundant Config/Lista buttons. Use the Main Tabs below. */}

        <Button
          variant="outline"
          onClick={() => {
            // Simplified URL construction for BrowserRouter
            const baseUrl = window.location.origin;
            // Use standard path without hash
            let url = `${baseUrl}/live-draw`;

            // Append matchId if available
            if (selectedMatchId) {
              url += `?matchId=${selectedMatchId}`;
            }

            // Open popup with specific specs
            window.open(url, 'LiveDraw', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes');
          }}
          className="border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          LIVE vMix (Popup)
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-blue-400 text-blue-400 bg-transparent hover:bg-blue-400 hover:text-white"
          title="Atualizar Sistema"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(`${window.location.origin}/${tenant?.slug || 'official'}`, '_blank')}
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
