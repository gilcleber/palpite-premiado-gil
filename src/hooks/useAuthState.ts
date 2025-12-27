
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

        let adminStatus = false;
        if (currentSession?.user) {
          adminStatus = await checkAdminStatus(currentSession.user.id);
        }
        
        setAuthState({
          session: currentSession,
          user: currentSession?.user ?? null,
          isAdmin: adminStatus,
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
        
        let adminStatus = false;
        if (newSession?.user && event === 'SIGNED_IN') {
          // Add a small delay to ensure the user is properly inserted
          setTimeout(async () => {
            if (mounted) {
              adminStatus = await checkAdminStatus(newSession.user.id);
              setAuthState(prev => ({ ...prev, isAdmin: adminStatus }));
            }
          }, 500);
        }
        
        setAuthState(prev => ({
          ...prev,
          session: newSession,
          user: newSession?.user ?? null,
          isAdmin: newSession?.user ? adminStatus : false,
        }));
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
