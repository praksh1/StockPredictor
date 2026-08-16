import { createClient } from "./supabase";

type MemberGateOptions = { requireOnboarding?: boolean };

export async function getMember(options: MemberGateOptions = {}) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) {
    window.location.assign("/login");
    return null;
  }

  if (options.requireOnboarding) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.onboarding_completed_at) {
      window.location.assign("/onboarding");
      return null;
    }
  }

  return auth.user;
}

