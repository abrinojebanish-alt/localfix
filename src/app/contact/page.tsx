import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">Contact us</h1>
      <p className="mt-3 text-ink/70">
        Have a question about a booking, a provider application, or the platform in general?
        Reach out and our team will get back to you.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
            <Mail className="h-5 w-5 text-brand" />
          </div>
          <div>
            <p className="text-sm text-ink/60">Email</p>
            <p className="font-medium text-ink">support@localfix.in</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
            <Phone className="h-5 w-5 text-brand" />
          </div>
          <div>
            <p className="text-sm text-ink/60">Phone</p>
            <p className="font-medium text-ink">+91 90000 00000</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
