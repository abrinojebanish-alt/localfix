import Link from "next/link";
import { Search, HandHelping, Wrench as WrenchIcon, MapPin, BadgeCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { HeroSearch } from "@/components/shared/HeroSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveCategories } from "@/lib/data/categories";
import { searchProviders } from "@/lib/data/providers";
import { TOWNS } from "@/lib/utils";

export default async function HomePage() {
  const [categories, providers] = await Promise.all([
    getActiveCategories(),
    searchProviders({}),
  ]);

  const topProviders = providers.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl md:text-5xl">
              Trusted local services, just around the corner.
            </h1>
            <p className="mt-4 max-w-md text-base text-ink/70">
              Find reliable electricians, plumbers, AC technicians and other local
              professionals in {TOWNS.join(", ")}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/providers">
                <Button size="lg">Find a Service</Button>
              </Link>
              <Link href="/provider/register">
                <Button size="lg" variant="outline">
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink">Popular Services</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <ServiceCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">How LocalFix Works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Step
              icon={Search}
              step={1}
              title="Find a service"
              description="Search or browse by category to find the right professional for the job."
            />
            <Step
              icon={HandHelping}
              step={2}
              title="Request a provider"
              description="Send a request with your address, preferred time, and what you need done."
            />
            <Step
              icon={WrenchIcon}
              step={3}
              title="Get the work done"
              description="Your provider confirms, arrives, and completes the job — you pay them directly."
            />
          </div>
        </div>
      </section>

      {/* Trusted providers */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Trusted Local Providers</h2>
          <Link href="/providers" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6">
          {topProviders.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {topProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={WrenchIcon}
              title="No providers yet"
              description="LocalFix providers in your area will appear here soon."
            />
          )}
        </div>
      </section>

      {/* Why LocalFix */}
      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">Why LocalFix?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Feature icon={MapPin} title="Local professionals" description="Serving Villukuri, Thuckalay and Marthandam." />
            <Feature icon={BadgeCheck} title="Verified providers" description="Every provider is reviewed before they go live." />
            <Feature icon={Search} title="Easy booking" description="Request a service in minutes, no back-and-forth calls." />
            <Feature icon={MessageCircle} title="Direct contact" description="Call or WhatsApp your provider directly, any time." />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Need help at home?
          </h2>
          <p className="mt-2 text-white/80">Find a LocalFix provider today.</p>
          <Link href="/providers" className="mt-6 inline-block">
            <Button size="lg" variant="primary">
              Find a Service
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof Search;
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
        <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-base font-bold text-ink">
        {step}. {title}
      </p>
      <p className="mt-1 text-sm text-ink/60">{description}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-canvas p-4">
      <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
      <p className="mt-2 font-display text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{description}</p>
    </div>
  );
}
