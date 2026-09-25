import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getAllCustomersForAdmin } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Customers" };

export default async function AdminCustomersPage() {
  await requireProfile(["admin"]);
  const customers = await getAllCustomersForAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Customers</h1>

      <div className="mt-6 flex flex-col gap-2">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <Card key={customer.id} className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{customer.full_name}</p>
                <p className="text-sm text-ink/60">{customer.email} · {customer.phone ?? "No phone"}</p>
              </div>
              <span className="text-xs text-ink/50">Joined {formatDate(customer.created_at)}</span>
            </Card>
          ))
        ) : (
          <EmptyState icon={Users} title="No customers yet." />
        )}
      </div>
    </div>
  );
}
