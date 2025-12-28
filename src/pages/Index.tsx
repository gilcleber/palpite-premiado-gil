
import { Card, CardContent } from "@/components/ui/card";
import BettingForm from "@/components/BettingForm";
import PrizeAnnouncement from "@/components/PrizeAnnouncement";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";

const Index = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden safe-area-inset-top safe-area-inset-bottom">
      {/* Background with blue gradient */}
      <div className="fixed inset-0 bg-[#1d244a]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        {/* Radio Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="./radio_logo.png"
            alt="Watermark"
            className="w-[90%] md:w-[70%] lg:w-[50%] opacity-15 mix-blend-normal grayscale blur-[1px]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Prize Announcement Section with animation */}
          <div className="animate-fade-in">
            <PrizeAnnouncement />
          </div>

          {/* Main Form Card - Transparent to unify blue theme */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="border-0 shadow-none bg-transparent overflow-hidden">
              <CardContent className="p-0">
                <BettingForm />
              </CardContent>
            </Card>
          </div>

          {/* Footer with modern styling */}
          <div className="text-center space-y-6 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-white/90 backdrop-blur-sm bg-white/15 rounded-full px-4 py-2 inline-block border border-white/20">
              © 2025 Palpite Premiado. Todos os direitos reservados.
            </p>

            <div className="flex justify-center gap-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="glass-card border-white/30 text-white hover:bg-white/25 transition-all duration-300 touch-optimized button-modern backdrop-blur-sm"
                >
                  <Link to="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Administrar
                  </Link>
                </Button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
