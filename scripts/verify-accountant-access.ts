
import { createClient } from "../lib/supabase/server"

async function verifyAccountant() {
    const supabase = await createClient();
    
    // Check current session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error("No authenticated user found.");
        return;
    }
    
    console.log("Logged in as:", user.email, "ID:", user.id);
    
    // Check profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
    if (profileError) {
        console.error("Error fetching profile:", profileError);
    } else {
        console.log("Profile data:", JSON.stringify(profile, null, 2));
        
        const isAccountant = profile?.is_accountant || profile?.role === "accountant" || !!profile?.custom_role_id;
        const isAdmin = profile?.is_admin || profile?.role === "admin";
        
        console.log("isAccountant:", isAccountant);
        console.log("isAdmin:", isAdmin);
        
        if (!isAccountant && !isAdmin) {
            console.log("This user would be REDIRECTED away from the accountant dashboard.");
        } else {
            console.log("This user has ACCESS to the accountant dashboard.");
        }
    }
}

verifyAccountant();
