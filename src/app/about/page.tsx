import type { Metadata } from "next";
import { TOWNS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "LocalFix connects customers with trusted local service providers.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">About LocalFix</h1>
      <div className="mt-6 space-y-4 text-ink/70">
        <p>
          LocalFix connects customers with trusted local service providers — electricians,
          plumbers, AC technicians, appliance repair technicians, cleaners, painters, carpenters,
          mechanics and other local professionals — across {TOWNS.join(", ")}.
        </p>
        <p>
          Every provider on LocalFix is reviewed by our team before they can accept bookings.
          Customers pay providers directly for completed work; LocalFix earns a small commission
          on completed jobs to keep the platform running.
        </p>
        <p>
          We&apos;re starting small and local on purpose — the goal is a platform that&apos;s
          genuinely useful for the towns we serve today, built to grow carefully from there.
        </p>
      </div>
    </div>
  );
}
