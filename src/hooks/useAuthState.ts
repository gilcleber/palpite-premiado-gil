
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
        // Check first access first, OR if magic link is used
        const dbFirstAccess = await checkFirstAccess();
        const forceSetup = window.location.href.includes('setup=true');
        const firstAccess = dbFirstAccess || forceSetup;

        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (!mounted) return;

        let adminResult = { isAdmin: false, role: null as any, tenantId: null as any, licenseExpired: false };
        if (currentSession?.user) {
          // SIMPLE MODE: Only check if user exists in admin_users
          const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('id, email')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (adminUser && !adminError) {
            adminResult = {
              isAdmin: true,
              role: 'super_admin', // Forced for classic mode
              tenantId: adminUser.id, // Self-tenant
              licenseExpired: false // Never expires in classic mode
            };
          }
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
            setAuthState(prev => ({
              ...prev,
              session: newSession,
              user: newSession.user,
            }));

            if (mounted) {
              // SIMPLE MODE REPEAT
              const { data: adminUser } = await supabase
                .from('admin_users')
                .select('id')
                .eq('id', newSession.user.id)
                .maybeSingle();

              if (adminUser) {
                adminResult = {
                  isAdmin: true,
                  role: 'super_admin',
                  tenantId: adminUser.id,
                  licenseExpired: false
                };
              }

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
