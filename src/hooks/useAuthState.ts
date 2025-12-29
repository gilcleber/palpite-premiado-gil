
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

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            // Just update session immediately, then checking admin status
            setAuthState(prev => ({
              ...prev,
              session: newSession,
              user: newSession.user,
              // Keep previous admin info until verified to avoid flashing
            }));

            if (mounted) {
              const adminResult = await checkAdminStatus(newSession.user.id);
              setAuthState(prev => ({
                ...prev,
                isAdmin: adminResult.isAdmin,
                role: adminResult.role,
                tenantId: adminResult.tenantId,
                licenseExpired: adminResult.licenseExpired,
                loading: false
              }));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // IMPORTANT: Do NOT reset isFirstAccess to false here, or re-check it.
          // Resetting to false blocks the "Create Admin" UI if the user logs out or fails login.
          const isAccess = await checkFirstAccess();

          setAuthState({
            session: null,
            user: null,
            isAdmin: false,
            role: null,
            tenantId: null,
            licenseExpired: false,
            loading: false,
            isFirstAccess: isAccess // Use the re-checked value
          });
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
