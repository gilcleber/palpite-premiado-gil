
import { createContext, useContext, ReactNode } from "react";
import { AuthContextProps } from "@/types/auth"; authState.session,
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
  { children }
    </AuthContext.Provider >
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
