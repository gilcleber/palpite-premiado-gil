
import { supabase } from "@/integrations/supabase/client";

export const signInUser = async (email: string, password: string, isFirstAccess: boolean) => {
  try {
    console.log("Starting sign in process...");

    // If it's first access, create the admin user first
    if (isFirstAccess) {
      console.log("First access detected, creating admin user...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError && !signUpError.message.includes("User already registered")) {
        console.error("Sign up error:", signUpError);
        throw signUpError;
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
    }

    // Sign in the user
    console.log("Signing in user...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }

    // SELF-HEALING: User logged in, but might be missing from admin tables ("Zombie State" recovery)
    if (data.user) {
      const userId = data.user.id;

      // 1. Check if exists in admin_users
      const { data: existingAdmin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingAdmin) {
        console.log("Self-healing: Missing admin_users record. Creating now...");
        await supabase.from("admin_users").insert([{ id: userId, email: email }]);
      }

      // 2. Check if exists in admin_profiles (Force Super Admin if missing and checks are loose)
      // This is handled by checkAdminStatus usually, but we can double check here or just rely on the database fix script.
    }

    console.log("Sign in successful");
    return { data };
  } catch (error: any) {
    console.error("Complete sign in error:", error);
    // return { error }; // Don't swallow error, throw it so UI sees it
    throw error;
  }
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
};
