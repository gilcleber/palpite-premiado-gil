
import { supabase } from "@/integrations/supabase/client";

export const checkFirstAccess = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .limit(1);

    const hasNoAdmins = !data || data.length === 0;
    console.log("First access check:", hasNoAdmins);
    return hasNoAdmins;
  } catch (error) {
    console.error("Error checking first access:", error);
    return true;
  }
};

export interface AdminProfileResult {
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | null;
  tenantId: string | null;
  licenseExpired: boolean;
}

export const checkAdminStatus = async (userId: string): Promise<AdminProfileResult> => {
  try {
    console.log("Checking admin status for user:", userId);

    // 1. Check new SaaS profile first
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select(`
        role,
        tenant_id,
        tenants (
          status,
          valid_until
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (profile && !profileError) {
      const tenant = profile.tenants as any; // Cast to avoid deep type issues for now

      // Check for license expiration
      let licenseExpired = false;
      if (tenant) {
        if (tenant.status === 'suspended' || tenant.status === 'inactive') {
          licenseExpired = true;
        } else if (tenant.valid_until) {
          const validUntil = new Date(tenant.valid_until);
          if (validUntil < new Date()) {
            licenseExpired = true;
          }
        }
      }

      // Super Admins are never expired
      if (profile.role === 'super_admin') {
        licenseExpired = false;
      }

      return {
        isAdmin: true,
        role: profile.role as 'super_admin' | 'admin',
        tenantId: profile.tenant_id,
        licenseExpired
      };
    }

    // 2. Fallback: Check legacy admin_users table (Backwards compatibility)
    // If user is in admin_users but not admin_profiles, treat as "Super Admin" for migration purposes 
    // or just a regular admin of a default tenant? 
    // Let's assume they are Super Admin to allow setting up the system.
    const { data: legacyAdmin, error: legacyError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (legacyAdmin && !legacyError) {
      console.log("User found in legacy admin_users, granting Super Admin access for migration.");
      return {
        isAdmin: true,
        role: 'super_admin', // Default old admins to super_admin so they can configure tenants
        tenantId: null,      // No tenant specific
        licenseExpired: false
      };
    }

    return {
      isAdmin: false,
      role: null,
      tenantId: null,
      licenseExpired: false
    };

  } catch (error) {
    console.error("Error checking admin status:", error);
    return {
      isAdmin: false,
      role: null,
      tenantId: null,
      licenseExpired: false
    };
  }
};
