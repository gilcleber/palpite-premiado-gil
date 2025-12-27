
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

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking admin status for user:", userId);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single();
    
    const adminStatus = !!data && !error;
    console.log("Admin status:", adminStatus, data);
    return adminStatus;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
