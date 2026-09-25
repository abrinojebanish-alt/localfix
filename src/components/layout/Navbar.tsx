"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, User, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

interface NavbarProps {
  profile: { full_name: string; role: UserRole } | null;
}

const publicLinks = [
  { href: "/services", label: "Services" },
  { href: "/providers", label: "Providers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function dashboardHref(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/provider/dashboard";
  return "/dashboard";
}

export function Navbar({ profile }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href ? "text-brand" : "text-ink/70 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link href={dashboardHref(profile.role)} className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href={profile.role === "provider" ? "/provider/profile" : "/profile"} className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink">
                <User className="h-4 w-4" /> Profile
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-canvas px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-line" />
            {profile ? (
              <>
                {profile.role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5">
                    Admin Dashboard
                  </Link>
                )}
                <Link href={dashboardHref(profile.role)} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5">
                  Dashboard
                </Link>
                <Link href={profile.role === "provider" ? "/provider/profile" : "/profile"} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5">
                  Profile
                </Link>
                <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-light">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="px-3 py-1">
                  <Button fullWidth>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
