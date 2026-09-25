import { createClient } from "@/lib/supabase/server";
import { Navbar } from "./Navbar";

export async function NavbarServer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <Navbar profile={null} />;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return <Navbar profile={profile} />;
}
