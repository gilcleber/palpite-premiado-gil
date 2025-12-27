
import { createContext, useContext, ReactNode } from "react";
import { AuthContextProps } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { signInUser, signOutUser } from "@/services/authService";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { authState, updateIsFirstAccess, updateIsAdmin } = useAuthState();

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInUser(email, password, authState.isFirstAccess);
      
      if (authState.isFirstAccess) {
        updateIsFirstAccess(false);
      }
      
      return result;
    } catch (error: any) {
      console.error("Complete sign in error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    await signOutUser();
    updateIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      session: authState.session, 
      user: authState.user, 
      signIn, 
      signOut, 
      loading: authState.loading, 
      isAdmin: authState.isAdmin, 
      isFirstAccess: authState.isFirstAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
