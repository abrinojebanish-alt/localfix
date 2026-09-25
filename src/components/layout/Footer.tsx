import Link from "next/link";
import { Logo } from "./Logo";
import { TOWNS } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink/60">
              Trusted local service providers in {TOWNS.join(", ")}.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Explore</p>
            <ul className="space-y-2 text-sm text-ink/60">
              <li><Link href="/services" className="hover:text-ink">Services</Link></li>
              <li><Link href="/providers" className="hover:text-ink">Find a provider</Link></li>
              <li><Link href="/provider/register" className="hover:text-ink">Become a provider</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Company</p>
            <ul className="space-y-2 text-sm text-ink/60">
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-xs text-ink/50">
          © {new Date().getFullYear()} LocalFix. Serving {TOWNS.join(", ")}.
        </div>
      </div>
    </footer>
  );
}
