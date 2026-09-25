import { createClient } from "@/lib/supabase/server";
import type { Provider, ProviderSummary, ProviderProfile, Category } from "@/types";

interface SearchProvidersParams {
  categorySlug?: string;
  town?: string;
  query?: string;
}

/**
 * Provider discovery — deliberately simple per spec: match service, match
 * town, then only verified + active providers (enforced again here on top of
 * RLS, so the intent is explicit in the query itself). No ranking algorithm —
 * results are ordered by rating then name.
 */
export async function searchProviders({
  categorySlug,
  town,
  query,
}: SearchProvidersParams): Promise<ProviderSummary[]> {
  const supabase = createClient();

  let providerIds: string[] | null = null;

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (!category) return [];

    const { data: links } = await supabase
      .from("provider_services")
      .select("provider_id")
      .eq("category_id", category.id);

    providerIds = (links ?? []).map((l) => l.provider_id);
    if (providerIds.length === 0) return [];
  }

  let providersQuery = supabase
    .from("providers")
    .select("*, provider_services(category:categories(*))")
    .eq("is_verified", true)
    .eq("is_active", true);

  if (providerIds) providersQuery = providersQuery.in("id", providerIds);
  if (town) providersQuery = providersQuery.eq("town", town);
  if (query) providersQuery = providersQuery.ilike("business_name", `%${query}%`);

  const { data: providers, error } = await providersQuery;
  if (error) throw error;
  if (!providers || providers.length === 0) return [];

  const ratings = await getRatingsForProviders(providers.map((p) => p.id));

  return providers
    .map((p) => toProviderSummary(p, ratings))
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0) || a.business_name.localeCompare(b.business_name));
}

export async function getProviderProfile(id: string): Promise<ProviderProfile | null> {
  const supabase = createClient();

  const { data: provider, error } = await supabase
    .from("providers")
    .select("*, provider_services(category:categories(*))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!provider) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, customer:profiles(full_name)")
    .eq("provider_id", id)
    .order("created_at", { ascending: false });

  const reviewRows = (reviews ?? []).map((r: any) => ({
    ...r,
    customer_name: r.customer?.full_name ?? "Customer",
  }));

  const ratings = await getRatingsForProviders([id]);
  const summary = toProviderSummary(provider, ratings);

  return { ...summary, reviews: reviewRows };
}

export async function getProviderByUserId(userId: string): Promise<Provider | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProviderCategories(providerId: string): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("provider_services")
    .select("category:categories(*)")
    .eq("provider_id", providerId);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.category);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function getRatingsForProviders(providerIds: string[]) {
  if (providerIds.length === 0) return new Map<string, { average: number; count: number }>();

  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("provider_id, rating")
    .in("provider_id", providerIds);

  const map = new Map<string, { average: number; count: number }>();
  const grouped = new Map<string, number[]>();

  for (const row of data ?? []) {
    const list = grouped.get(row.provider_id) ?? [];
    list.push(row.rating);
    grouped.set(row.provider_id, list);
  }

  for (const [providerId, list] of grouped) {
    const average = Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 10) / 10;
    map.set(providerId, { average, count: list.length });
  }

  return map;
}

function toProviderSummary(
  provider: any,
  ratings: Map<string, { average: number; count: number }>
): ProviderSummary {
  const rating = ratings.get(provider.id);
  return {
    ...provider,
    categories: (provider.provider_services ?? []).map((row: any) => row.category),
    average_rating: rating?.average ?? null,
    review_count: rating?.count ?? 0,
  };
}
