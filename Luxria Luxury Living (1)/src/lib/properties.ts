import { supabase } from "@/integrations/supabase/client";

export type Property = {
  id: string;
  slug: string;
  title: string;
  location: string;
  price_amount: number;
  price_currency: string;
  price_suffix: string | null;
  status: string;
  badge: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string | null;
  features: string[];
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
  sort_order: number;
  property_type: "house" | "commercial" | "villa" | "land";
  listing_type: "rent" | "buy" | "both";
};

export type PropertyImage = {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
};

export type PropertyWithCover = Property & { cover_url: string | null };

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80";

export function formatPrice(p: Pick<Property, "price_currency" | "price_amount" | "price_suffix">) {
  return `${p.price_currency} ${p.price_amount} ${p.price_suffix ?? ""}`.trim();
}

export async function fetchPropertiesWithCovers(): Promise<PropertyWithCover[]> {
  const { data: props, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const ids = (props ?? []).map((p) => p.id);
  if (!ids.length) return [];

  const { data: imgs } = await supabase
    .from("property_images")
    .select("property_id,url,sort_order")
    .in("property_id", ids)
    .order("sort_order", { ascending: true });

  const cover = new Map<string, string>();
  (imgs ?? []).forEach((i) => {
    if (!cover.has(i.property_id)) cover.set(i.property_id, i.url);
  });

  return (props ?? []).map((p) => ({
    ...(p as Property),
    features: Array.isArray((p as any).features) ? ((p as any).features as string[]) : [],
    cover_url: cover.get(p.id) ?? FALLBACK_IMG,
  }));
}

export type PropertyDetailResult = {
  property: Property;
  images: PropertyImage[];
};

export async function fetchPropertyBySlug(slug: string): Promise<PropertyDetailResult | null> {
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!property) return null;

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  return {
    property: {
      ...(property as Property),
      features: Array.isArray((property as any).features)
        ? ((property as any).features as string[])
        : [],
    },
    images: (images ?? []) as PropertyImage[],
  };
}