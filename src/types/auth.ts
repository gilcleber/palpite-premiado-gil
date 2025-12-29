
import { Session, User } from "@supabase/supabase-js";

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string, forceSetup?: boolean) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | null;
  tenantId: string | null;
  isFirstAccess: boolean;
  licenseExpired?: boolean;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | null;
  tenantId: string | null;
  loading: boolean;
  isFirstAccess: boolean;
  licenseExpired?: boolean;
}
