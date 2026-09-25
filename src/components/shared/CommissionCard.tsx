import { Card } from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";

interface CommissionCardProps {
  label: string;
  amount: number;
  tone?: "default" | "brand" | "signal";
  helperText?: string;
}

const toneClasses = {
  default: "text-ink",
  brand: "text-brand",
  signal: "text-signal-dark",
};

export function CommissionCard({ label, amount, tone = "default", helperText }: CommissionCardProps) {
  return (
    <Card>
      <p className="text-sm text-ink/60">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-extrabold", toneClasses[tone])}>
        {formatCurrency(amount)}
      </p>
      {helperText && <p className="mt-1 text-xs text-ink/50">{helperText}</p>}
    </Card>
  );
}
