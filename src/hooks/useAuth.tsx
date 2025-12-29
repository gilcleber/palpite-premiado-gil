
import { createContext, useContext, ReactNode } from "react";
import { AuthContextProps } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { signInUser, signOutUser } from "@/services/authService";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { authState, updateIsFirstAccess, updateIsAdmin } = useAuthState();

  const signIn = async (email: string, password: string, forceSetup: boolean = false) => {
    try {
      const isCreation = authState.isFirstAccess || forceSetup;
      const result = await signInUser(email, password, isCreation);

      if (isCreation) {
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
      role: authState.role,
      tenantId: authState.tenantId,
      licenseExpired: authState.licenseExpired,
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
