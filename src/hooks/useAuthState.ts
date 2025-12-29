
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
        console.log("🔒 Autenticação ignorada (Bypass Ativo)");

        // MOCK SUPER ADMIN SESSION
        const mockSession = {
          access_token: "mock_token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock_refresh",
          user: {
            id: "bypass-admin-id",
            aud: "authenticated",
            role: "authenticated",
            email: "admin@bypass.com",
            email_confirmed_at: new Date().toISOString(),
            phone: "",
            confirmation_sent_at: "",
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: {},
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };

        setAuthState({
          session: mockSession as any,
          user: mockSession.user as any,
          isAdmin: true, // FORCE ADMIN
          role: 'super_admin', // FORCE SUPER ADMIN
          tenantId: 'bypass-tenant-id',
          licenseExpired: false,
          loading: false,
          isFirstAccess: false,
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
          const dbFirstAccess = await checkFirstAccess();
          const forceSetup = window.location.href.includes('setup=true');
          const isAccess = dbFirstAccess || forceSetup;

          setAuthState({
            session: null,
            user: null,
            isAdmin: false,
            role: null,
            tenantId: null,
            licenseExpired: false,
            loading: false,
            isFirstAccess: isAccess
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
