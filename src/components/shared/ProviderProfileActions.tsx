"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RequestServiceForm } from "./RequestServiceForm";
import { telLink, whatsappLink } from "@/lib/utils";
import type { Category } from "@/types";

interface ProviderProfileActionsProps {
  providerId: string;
  businessName: string;
  phone: string;
  categories: Category[];
}

export function ProviderProfileActions({
  providerId,
  businessName,
  phone,
  categories,
}: ProviderProfileActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={() => setOpen(true)} disabled={categories.length === 0}>
          Request Service
        </Button>
        <a href={telLink(phone)}>
          <Button size="lg" variant="outline">
            <Phone className="h-4 w-4" /> Call
          </Button>
        </a>
        <a
          href={whatsappLink(phone, `Hi ${businessName}, I found you on LocalFix.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" variant="outline">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </a>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Request Service">
        <RequestServiceForm providerId={providerId} categories={categories} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
