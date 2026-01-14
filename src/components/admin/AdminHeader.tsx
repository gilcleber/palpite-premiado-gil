
import { Shield, Settings, Filter, SortDesc, LogOut, ExternalLink, Home } from "lucide-react";
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
            // Safe Popup for Live Draw
            let url = window.location.origin + window.location.pathname.replace('/admin', '/live-draw');
            if (url.includes('/#')) {
              // Handle HashRouter: origin/#/live-draw
              url = url.replace(/\/$/, ""); // trim trailing slash
            } else {
              // If we are on /#/admin, pathname is just / usually in hash router context? 
              // Actually with HashRouter, window.location.pathname is usually /index.html or just /.
              // The hash part is window.location.hash
              const baseUrl = window.location.origin + window.location.pathname;
              url = baseUrl + '#/live-draw';
            }

            // Append matchId
            if (selectedMatchId) {
              url += `?matchId=${selectedMatchId}`;
            }

            window.open(url, 'LiveDraw', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
          }}
          className="border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          LIVE vMix (Popup)
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(`${window.location.origin}/?tenant=${tenant?.slug || 'official'}`, '_blank')}
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
