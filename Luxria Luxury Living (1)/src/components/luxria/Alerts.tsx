import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { spring, fadeUp, stagger, slideInLeft } from "./motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Alerts() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    intent: "",
    property_type: "",
    region: "",
    budget: "",
    whatsapp: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.full_name.trim() || form.full_name.trim().length < 1) {
      toast.error("Please enter your full name");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!form.consent) {
      toast.error("Please accept the privacy policy");
      return;
    }

    const lines = [
      "📬 Property Alert Subscription",
      form.intent && `Looking to: ${form.intent}`,
      form.property_type && `Property type: ${form.property_type}`,
      form.region && `Region: ${form.region}`,
      form.budget && `Budget: ${form.budget}`,
    ].filter(Boolean);

    setSubmitting(true);
    const { error } = await supabase.from("property_leads").insert({
      property_id: null,
      full_name: form.full_name.trim().slice(0, 200),
      email: form.email.trim().slice(0, 200),
      whatsapp: form.whatsapp.trim().slice(0, 50) || null,
      message: lines.join("\n").slice(0, 2000) || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message sent successfully!", {
      description: "We've received your request and will be in touch shortly.",
      duration: 5000,
    });
    setForm({
      full_name: "",
      email: "",
      intent: "",
      property_type: "",
      region: "",
      budget: "",
      whatsapp: "",
      consent: false,
    });
  };

  return (
    <section id="about" ref={ref} className="relative overflow-hidden py-24 sm:py-32">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-[15%] -bottom-[15%]"
      >
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"
          alt="Luxury building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ margin: "-100px" }}
        >
          <motion.span
            variants={slideInLeft}
            className="text-sm uppercase tracking-[0.3em] text-primary"
          >
            Get Property Alerts
          </motion.span>
          <motion.h2
            variants={slideInLeft}
            className="mt-4 font-serif-display text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-tight"
          >
            Be the First to Know <br /> About New Properties
          </motion.h2>
          <motion.p variants={slideInLeft} className="mt-6 text-white/80 max-w-md">
            Join <span className="text-primary font-semibold">10,000+</span> other subscribers in
            our Luxria Property community.
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-80px" }}
          transition={spring}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            <Field label="Full name">
              <input
                type="text"
                placeholder="Name"
                className="form-input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                maxLength={200}
              />
            </Field>
            <Field label="Do you want to buy or rent?">
              <LuxSelect
                placeholder="Choose option"
                options={["Buy", "Rent"]}
                value={form.intent}
                onChange={(v) => setForm({ ...form, intent: v })}
              />
            </Field>

            <Field label="Email address" full>
              <input
                type="email"
                placeholder="Type your email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={200}
              />
            </Field>

            <Field label="Type of property">
              <LuxSelect
                placeholder="Select property type"
                options={["Apartment", "Villa", "Penthouse", "Townhouse"]}
                value={form.property_type}
                onChange={(v) => setForm({ ...form, property_type: v })}
              />
            </Field>
            <Field label="Region">
              <LuxSelect
                placeholder="Select region"
                options={["North", "South", "East", "West", "Central"]}
                value={form.region}
                onChange={(v) => setForm({ ...form, region: v })}
              />
            </Field>

            <Field label="Budget range">
              <LuxSelect
                placeholder="Select price range"
                options={["Rs 1M – 5M", "Rs 5M – 15M", "Rs 15M – 50M", "Rs 50M+"]}
                value={form.budget}
                onChange={(v) => setForm({ ...form, budget: v })}
              />
            </Field>
            <Field label="WhatsApp number">
              <div className="flex">
                <span className="inline-flex items-center gap-1 px-2 rounded-l-lg border border-r-0 border-border bg-muted text-xs">
                  <span className="w-5 h-3.5 inline-block rounded-sm overflow-hidden flex-shrink-0">
                    <span className="block h-1/4 bg-red-600" />
                    <span className="block h-1/4 bg-blue-700" />
                    <span className="block h-1/4 bg-yellow-400" />
                    <span className="block h-1/4 bg-green-700" />
                  </span>
                  ▾
                </span>
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  className="form-input rounded-l-none"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  maxLength={50}
                />
              </div>
            </Field>

            <label className="sm:col-span-2 flex items-center gap-2.5 text-sm text-foreground/80">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary rounded"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              You agree to our friendly privacy policy.
            </label>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 relative overflow-hidden w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl group"
            >
              <span className="relative z-10">{submitting ? "Sending…" : "Get instant alert"}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </form>
        </motion.div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 0.95rem;
          border-radius: 0.6rem;
          border: 1px solid var(--color-border);
          background: white;
          font-size: 0.9rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .form-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 20%, transparent);
        }
      `}</style>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function LuxSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="form-input h-auto !shadow-none data-[placeholder]:text-muted-foreground">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="rounded-xl border-border/70 shadow-2xl bg-white/95 backdrop-blur-md p-1"
        position="popper"
        sideOffset={6}
      >
        {options.map((o) => (
          <SelectItem
            key={o}
            value={o}
            className="rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:bg-primary/10 focus:text-foreground data-[state=checked]:text-primary data-[state=checked]:font-semibold"
          >
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}