import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Check, Phone, Mail, User,
} from "lucide-react";
import { fetchPropertyBySlug, formatPrice, type PropertyDetailResult, type PropertyImage } from "@/lib/properties";
import { Navbar } from "@/components/luxria/Navbar";
import { Footer } from "@/components/luxria/Footer";
import { SmoothScroll } from "@/components/luxria/SmoothScroll";
import { spring, fadeUp, stagger } from "@/components/luxria/motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/property/$slug")({
  head: ({ loaderData }: { loaderData?: PropertyDetailResult }) => ({
    meta: [
      { title: loaderData ? `${loaderData.property.title} — Luxria` : "Property — Luxria" },
      { name: "description", content: loaderData?.property.description?.slice(0, 160) ?? "" },
      { property: "og:title", content: loaderData?.property.title ?? "Luxria" },
      { property: "og:description", content: loaderData?.property.description?.slice(0, 160) ?? "" },
      { property: "og:image", content: loaderData?.images[0]?.url ?? "" },
    ],
  }),
  loader: async ({ params }): Promise<PropertyDetailResult> => {
    const result = await fetchPropertyBySlug(params.slug);
    if (!result) throw notFound();
    return result;
  },
  component: PropertyDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-serif-display text-4xl">Property not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary">← Back home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-foreground">
      <p>Something went wrong: {error.message}</p>
    </div>
  ),
});

function PropertyDetail() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["property", slug],
    queryFn: () => fetchPropertyBySlug(slug),
    initialData: initial,
  });
  if (!data) return null;
  const { property, images } = data;
  const cover = images[0]?.url;
  const thumbs = images.slice(1, 5);

  return (
    <main className="bg-background text-foreground">
      <SmoothScroll />
      <Navbar />

      <section className="pt-28 pb-12 max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> All properties
        </Link>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
            <motion.h1 variants={fadeUp} className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight">
              {property.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" /> {property.location}
            </motion.p>
          </div>
          <motion.div variants={fadeUp} className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Price</p>
            <p className="font-serif-display text-4xl text-primary">{formatPrice(property)}</p>
          </motion.div>
        </motion.div>

        {/* Gallery */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="lg:col-span-2 aspect-[4/3] rounded-2xl overflow-hidden bg-muted"
          >
            {cover && <img src={cover} alt={property.title} className="w-full h-full object-cover" />}
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {thumbs.map((img: PropertyImage, i: number) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.1 * (i + 1) }}
                className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                    +{images.length - 5} photos
                  </div>
                )}
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, 4 - thumbs.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-[4/3] rounded-xl bg-muted/60 border border-dashed border-border" />
            ))}
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Badges + quick info */}
            <div className="flex flex-wrap gap-2">
              <Badge>{property.status}</Badge>
              {property.badge && <Badge variant="accent">{property.badge}</Badge>}
            </div>

            <div className="flex flex-wrap gap-6 text-foreground">
              <Stat icon={Bed} label="Bedrooms" value={property.bedrooms} />
              <Stat icon={Bath} label="Bathrooms" value={property.bathrooms} />
              <Stat icon={Maximize} label="Square ft" value={property.sqft.toLocaleString()} />
            </div>

            <section>
              <h2 className="font-serif-display text-3xl font-medium">Property description</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {property.features.length > 0 && (
              <section className="bg-muted/40 rounded-2xl p-6 sm:p-8">
                <h2 className="font-serif-display text-2xl font-medium">Top features</h2>
                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="w-3 h-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Map */}
            {property.latitude != null && property.longitude != null && (
              <section>
                <h2 className="font-serif-display text-3xl font-medium">Location</h2>
                <p className="mt-2 text-muted-foreground">{property.location}</p>
                <div className="mt-5 rounded-2xl overflow-hidden border border-border shadow-lg aspect-[16/10]">
                  <iframe
                    title="Location map"
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Open in Google Maps <MapPin className="w-3.5 h-3.5" />
                </a>
              </section>
            )}

          </div>

          {/* Sticky form */}
          <aside className="lg:sticky lg:top-28 self-start">
            <ContactForm propertyId={property.id} propertyTitle={property.title} />
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" }) {
  const style =
    variant === "accent"
      ? "bg-primary text-primary-foreground"
      : "bg-blue-600 text-white";
  return <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${style}`}>{children}</span>;
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-white">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

function ContactForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [form, setForm] = useState({ full_name: "", email: "", whatsapp: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast.error("Please fill in your name and email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("property_leads").insert({
      property_id: propertyId,
      full_name: form.full_name,
      email: form.email,
      whatsapp: form.whatsapp || null,
      message: form.message || `Interested in ${propertyTitle}`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Request sent! We'll be in touch.");
      setForm({ full_name: "", email: "", whatsapp: "", message: "" });
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-secondary/60 border border-border p-6 sm:p-7 shadow-xl">
      <h3 className="font-serif-display text-2xl text-primary font-semibold">Interested in this property?</h3>
      <div className="mt-5 space-y-4">
        <LabeledInput icon={User} label="Full name" placeholder="Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <LabeledInput icon={Mail} type="email" label="Email address" placeholder="Type your email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <LabeledInput icon={Phone} label="WhatsApp number" placeholder="WhatsApp number" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Hello, I'd like to know more…"
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-xl">
          {loading ? "Sending…" : "Request a site visit"}
        </Button>
      </div>
    </form>
  );
}

function LabeledInput({
  icon: Icon, label, placeholder, value, onChange, type = "text",
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border border-border bg-white py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${Icon ? "pl-10 pr-3.5" : "px-3.5"}`}
        />
      </div>
    </div>
  );
}
