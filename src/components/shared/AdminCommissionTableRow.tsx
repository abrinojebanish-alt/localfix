"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { BookingWithDetails } from "@/types";

export function AdminCommissionTableRow({ booking }: { booking: BookingWithDetails }) {
  const [loading, setLoading] = useState<"paid" | "waived" | null>(null);
  const router = useRouter();
  const { show } = useToast();

  async function setCommissionStatus(status: "paid_to_localfix" | "waived") {
    setLoading(status === "paid_to_localfix" ? "paid" : "waived");
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ commission_status: status }).eq("id", booking.id);
    setLoading(null);
    if (!error) {
      show(status === "paid_to_localfix" ? "Marked as paid." : "Commission waived.");
      router.refresh();
    }
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-3 pr-4">
        <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-ink hover:text-brand">
          {booking.provider_business_name}
        </Link>
      </td>
      <td className="py-3 pr-4 text-ink/60">{formatCurrency(booking.final_amount)}</td>
      <td className="py-3 pr-4 text-ink/60">{booking.commission_percentage}%</td>
      <td className="py-3 pr-4 text-ink/60">{formatCurrency(booking.commission_amount)}</td>
      <td className="py-3 pr-4 text-ink/60">{formatCurrency(booking.provider_amount)}</td>
      <td className="py-3 pr-4">
        <StatusBadge status={booking.commission_status} />
      </td>
      <td className="py-3">
        <div className="flex gap-1.5">
          {booking.commission_status !== "paid_to_localfix" && (
            <Button size="sm" variant="outline" loading={loading === "paid"} onClick={() => setCommissionStatus("paid_to_localfix")}>
              Mark Paid
            </Button>
          )}
          {booking.commission_status !== "waived" && (
            <Button size="sm" variant="ghost" loading={loading === "waived"} onClick={() => setCommissionStatus("waived")}>
              Waive
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
