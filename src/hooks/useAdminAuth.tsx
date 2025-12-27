
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AdminAuthContextProps {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  isFirstAccess: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(false);

  const checkFirstAccess = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .limit(1);
      
      const hasNoAdmins = !data || data.length === 0;
      setIsFirstAccess(hasNoAdmins);
      console.log("First access check:", hasNoAdmins);
      return hasNoAdmins;
    } catch (error) {
      console.error("Error checking first access:", error);
      setIsFirstAccess(true);
      return true;
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .single();
      
      const adminStatus = !!data && !error;
      setIsAdmin(adminStatus);
      console.log("Admin status:", adminStatus, data);
      return adminStatus;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check first access
        await checkFirstAccess();
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkAdminStatus(currentSession.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (mounted) {
              await checkAdminStatus(newSession.user.id);
            }
          }, 1000);
        } else {
          setIsAdmin(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting admin sign in process...");
      
      // If it's first access, create the admin user first
      if (isFirstAccess) {
        console.log("First access detected, creating admin user...");
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError && !signUpError.message.includes("User already registered")) {
          console.error("Sign up error:", signUpError);
          return { success: false, error: signUpError.message };
        }
        
        if (signUpData.user) {
          // Insert into admin_users table
          const { error: insertError } = await supabase
            .from("admin_users")
            .insert([{ 
              id: signUpData.user.id, 
              email: email 
            }]);
            
          if (insertError) {
            console.error("Error inserting admin user:", insertError);
          } else {
            console.log("Admin user created successfully");
          }
        }
        
        setIsFirstAccess(false);
      }
      
      // Sign in the user
      console.log("Signing in user...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Sign in successful");
      return { success: true };
    } catch (error: any) {
      console.error("Complete sign in error:", error);
      return { success: false, error: error.message || "Erro desconhecido" };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signOut, 
      loading, 
      isAdmin, 
      isFirstAccess
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
