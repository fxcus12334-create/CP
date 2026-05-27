import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { spring, fadeUp, stagger } from "./motion";
import { fetchPropertiesWithCovers, formatPrice } from "@/lib/properties";
import { useSearchFilter, setSearchFilter, PRICE_RANGES } from "./searchFilter";
import { useMemo } from "react";

export function Properties() {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties", "list"],
    queryFn: fetchPropertiesWithCovers,
  });
  const filter = useSearchFilter();

  const filtered = useMemo(() => {
    if (!filter.applied) return properties;
    return properties.filter((p) => {
      if (filter.listing !== "all" && p.listing_type !== filter.listing && p.listing_type !== "both") return false;
      if (filter.propertyType !== "all" && p.property_type !== filter.propertyType) return false;
      if (filter.location !== "all") {
        const slug = p.location.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (!slug.includes(filter.location)) return false;
      }
      if (filter.price !== "all") {
        const range = PRICE_RANGES[filter.price];
        if (range && (p.price_amount < range[0] || p.price_amount > range[1])) return false;
      }
      return true;
    });
  }, [properties, filter]);

  return (
    <section id="properties" className="relative bg-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ margin: "-100px" }}
          className="max-w-2xl"
        >
          <motion.span
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.3em] text-primary"
          >
            Featured Listings
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-tight"
          >
            Check out our latest properties
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-muted-foreground max-w-xl">
            A hand-picked collection of estates, villas, and skyline residences from across the
            island — curated for the most discerning buyers.
          </motion.p>
        </motion.div>

        {filter.applied && (
          <div className="mt-8 flex items-center justify-between flex-wrap gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"}
              {" "}for <span className="text-primary font-semibold uppercase">{filter.listing}</span>
              {filter.propertyType !== "all" && <> · {filter.propertyType}</>}
              {filter.location !== "all" && <> · {filter.location.replace(/-/g, " ")}</>}
              {filter.price !== "all" && <> · Rs {filter.price}M</>}
            </p>
            <button
              onClick={() => setSearchFilter({ listing: "all", propertyType: "all", location: "all", price: "all", applied: false })}
              className="text-xs uppercase tracking-wider text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ margin: "-80px" }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={spring}
            >
              <Link
                to="/property/$slug"
                params={{ slug: p.slug }}
                className="block group bg-white rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={p.cover_url ?? ""}
                    alt={p.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80";
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                  />
                  {p.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                        {p.badge}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-foreground">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="font-serif-display text-2xl font-semibold text-primary">
                    {formatPrice(p)}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {p.location}
                  </div>
                  <div className="mt-5 pt-5 border-t border-border flex items-center justify-between text-sm text-foreground/80">
                    <span className="inline-flex items-center gap-1.5"><Bed className="w-4 h-4 text-primary" /> {p.bedrooms} Beds</span>
                    <span className="inline-flex items-center gap-1.5"><Bath className="w-4 h-4 text-primary" /> {p.bathrooms} Baths</span>
                    <span className="inline-flex items-center gap-1.5"><Maximize className="w-4 h-4 text-primary" /> {p.sqft} ft²</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        {filter.applied && filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            No properties match your filters. Try clearing them above.
          </p>
        )}
      </div>
    </section>
  );
}