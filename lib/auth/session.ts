// lib/auth/session.ts
// Server-side session helpers for the admin panel.
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type SessionUser = { 
  id: string; 
  role: string;
  user_id?: string;
  kyc_status?: string;
};

/**
 * Resolve the signed-in user on the server.
 * 
 * TODO: Replace this with your real session logic:
 * 1. Get session token from cookies
 * 2. Verify/decode the token
 * 3. Query auth_users table to get user data
 * 4. Return SessionUser with actual UUID from database
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // TEMPORARY WORKAROUND: Get the first owner from database
  // This allows testing the KYC system before your auth is fully integrated
  
  try {
    const { data: user, error } = await supabase
      .from("auth_users")
      .select("id, user_id, role, kyc_status")
      .eq("role", "owner")
      .limit(1)
      .single();
    
    if (error || !user) {
      // If no owner exists, get any user
      const { data: anyUser } = await supabase
        .from("auth_users")
        .select("id, user_id, role, kyc_status")
        .limit(1)
        .single();
      
      if (anyUser) {
        return {
          id: anyUser.id,
          role: anyUser.role,
          user_id: anyUser.user_id,
          kyc_status: anyUser.kyc_status,
        };
      }
      
      return null;
    }
    
    return {
      id: user.id,
      role: user.role,
      user_id: user.user_id,
      kyc_status: user.kyc_status,
    };
  } catch (err) {
    console.error("Session error:", err);
    return null;
  }
  
  // Example of what your real implementation should look like:
  /*
  const token = (await cookies()).get("session_token")?.value;
  if (!token) return null;
  
  // Decode your JWT or verify session
  const decoded = await verifyToken(token);
  if (!decoded) return null;
  
  // Get user from database using the actual UUID
  const { data: user, error } = await supabase
    .from("auth_users")
    .select("id, user_id, role, kyc_status")
    .eq("id", decoded.userId)
    .single();
    
  if (error || !user) return null;
  
  return {
    id: user.id,           // UUID from database
    role: user.role,       // 'user', 'admin', or 'owner'
    user_id: user.user_id, // Human-readable ID like 'USR-001'
    kyc_status: user.kyc_status,
  };
  */
}

/**
 * The admin the current request should act as.
 *
 * While the owner is impersonating, `impersonating_admin_id` names the admin.
 * The cookie only counts if the real session is the owner, so a forged cookie
 * does nothing once getSessionUser() is wired to real sessions.
 */
export async function getEffectiveAdminId(): Promise<{
  id: string | undefined;
  impersonating: boolean;
}> {
  const session = await getSessionUser();
  const imp = (await cookies()).get("impersonating_admin_id")?.value;
  if (imp && session?.role === "owner") return { id: imp, impersonating: true };
  return { id: session?.id, impersonating: false };
}

/** True while the owner has an active admin-impersonation cookie. */
export async function isImpersonating(): Promise<boolean> {
  return (await cookies()).has("impersonating_admin_id");
}
