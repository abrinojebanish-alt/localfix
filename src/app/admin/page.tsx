import type { Metadata } from "next";
import Link from "next/link";
import { Users, Wrench, ClipboardList, IndianRupee, Tags, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { requireProfile } from "@/lib/auth";
import { getPlatformStats } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin Dashboard" };

const quickLinks = [
  { href: "/admin/providers", label: "Providers", icon: Wrench },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/commissions", label: "Commissions", icon: IndianRupee },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminDashboardPage() {
  await requireProfile(["admin"]);
  const stats = await getPlatformStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Admin Dashboard</h1>

      <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3">
        <Stat label="Customers" value={stats.totalCustomers} />
        <Stat label="Providers" value={stats.totalProviders} />
        <Stat label="Pending Verification" value={stats.pendingProviders} tone="signal" />
        <Stat label="Total Bookings" value={stats.totalBookings} />
        <Stat label="Active Bookings" value={stats.activeBookings} tone="brand" />
        <Stat label="Completed Bookings" value={stats.completedBookings} tone="verified" />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="flex items-center gap-3 transition-colors hover:border-brand">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
                <link.icon className="h-5 w-5 text-brand" />
              </div>
              <span className="font-display font-bold text-ink">{link.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "signal" | "brand" | "verified" }) {
  const toneClass = tone === "signal" ? "text-signal-dark" : tone === "brand" ? "text-brand" : tone === "verified" ? "text-verified" : "text-ink";
  return (
    <Card>
      <p className="text-sm text-ink/60">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${toneClass}`}>{value}</p>
    </Card>
  );
}
