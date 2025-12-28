
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { checkFirstAccess, checkAdminStatus } from "@/utils/adminUtils";
import { AuthState } from "@/types/auth";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isAdmin: false,
    role: null,
    tenantId: null,
    licenseExpired: false,
    loading: true,
    isFirstAccess: false,
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check first access first
        const firstAccess = await checkFirstAccess();

        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (!mounted) return;

        let adminResult = { isAdmin: false, role: null as any, tenantId: null as any, licenseExpired: false };
        if (currentSession?.user) {
          adminResult = await checkAdminStatus(currentSession.user.id);
        }

        setAuthState({
          session: currentSession,
          user: currentSession?.user ?? null,
          isAdmin: adminResult.isAdmin,
          role: adminResult.role,
          tenantId: adminResult.tenantId,
          licenseExpired: adminResult.licenseExpired,
          loading: false,
          isFirstAccess: firstAccess,
        });
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log("Auth state changed:", event, newSession?.user?.id);

        let adminResult = { isAdmin: false, role: null as any, tenantId: null as any, licenseExpired: false };

        if (event === 'SIGNED_IN' || (event === 'TOKEN_REFRESHED' && newSession)) {
          // Set loading true immediately to prevent early access denial
          setAuthState(prev => ({ ...prev, loading: true }));

          if (newSession?.user) {
            // Add a small delay to ensure the user is properly inserted (if new) or data is propagated
            // But usually immediate check is fine for existing users. 
            // Keeping a small delay just in case of triggers.
            await new Promise(resolve => setTimeout(resolve, 500));

            if (mounted) {
              adminResult = await checkAdminStatus(newSession.user.id);
            }
          }
        }

        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            session: newSession,
            user: newSession?.user ?? null,
            isAdmin: adminResult.isAdmin,
            role: adminResult.role,
            tenantId: adminResult.tenantId,
            licenseExpired: adminResult.licenseExpired,
            loading: false, // Finished loading
          }));
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateIsFirstAccess = (value: boolean) => {
    setAuthState(prev => ({ ...prev, isFirstAccess: value }));
  };

  const updateIsAdmin = (value: boolean) => {
    setAuthState(prev => ({ ...prev, isAdmin: value }));
  };

  return {
    authState,
    updateIsFirstAccess,
    updateIsAdmin,
  };
};
