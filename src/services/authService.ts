
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
    
    console.log("Sign in successful");
    return { data };
  } catch (error: any) {
    console.error("Complete sign in error:", error);
    return { error };
  }
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
};
