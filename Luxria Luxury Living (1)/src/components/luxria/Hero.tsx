import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { spring, fadeUp, stagger, wordReveal } from "./motion";
import { CountUp } from "./CountUp";
import { setSearchFilter } from "./searchFilter";

const TABS = ["Rent", "Buy"] as const;
type Tab = (typeof TABS)[number];

type PropertyTypeValue = "house" | "commercial" | "villa" | "land";

const TYPES_BY_TAB: Record<Tab, { value: PropertyTypeValue; label: string }[]> = {
  Rent: [
    { value: "house", label: "House" },
    { value: "commercial", label: "Commercial space" },
    { value: "villa", label: "Villa/Bungalow" },
  ],
  Buy: [
    { value: "land", label: "Land" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa/Bungalow" },
    { value: "commercial", label: "Commercial space" },
  ],
};

const headline = "Luxria Zero Traka".split(" ");

const metrics = [
  { value: 1450, suffix: "+", label: "Happy Customers" },
  { value: 800, suffix: "+", label: "Properties Ready" },
  { value: 20, suffix: "+", label: "Years of Experience" },
];

export function Hero() {
  const [tab, setTab] = useState<Tab>("Rent");
  const [openTab, setOpenTab] = useState<Tab | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (tabsRef.current && !tabsRef.current.contains(e.target as Node)) {
        setOpenTab(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const applyFilter = (selectedTab: Tab, type: PropertyTypeValue) => {
    setSearchFilter({
      listing: selectedTab.toLowerCase() as "rent" | "buy",
      propertyType: type,
      location: "all",
      price: "all",
      applied: true,
    });
    requestAnimationFrame(() => {
      document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const currentTypes = TYPES_BY_TAB[tab];

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden">
      {/* Video */}
      <video
        key="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80"
        className="absolute inset-0 w-full h-full object-cover"
        src="https://videos.pexels.com/video-files/7578541/7578541-uhd_3840_2160_30fps.mp4"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-16 min-h-screen flex flex-col justify-center">
        <motion.div
          variants={stagger(0.12, 0.2)}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block px-4 py-1.5 rounded-full text-xs tracking-[0.3em] uppercase text-primary border border-primary/40 bg-white/5 backdrop-blur-sm"
          >
            Ultra-Luxury Real Estate
          </motion.span>

          <h1 className="mt-6 font-serif-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium text-white leading-[1.05] tracking-tight">
            {headline.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pr-3 align-bottom">
                <motion.span variants={wordReveal} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed"
          >
            We simplify every step of the real estate journey with modern tools, expert support
            and total transparency.
          </motion.p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 1 }}
          className="mt-10 max-w-4xl"
        >
          {/* Tabs */}
          <div ref={tabsRef} className="relative inline-block">
            <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/15 rounded-full p-1.5">
              {TABS.map((t) => {
                const active = tab === t;
                const isOpen = openTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setOpenTab(isOpen ? null : t);
                    }}
                    className="relative px-5 sm:px-7 py-2.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5"
                  >
                    {active && (
                      <motion.div
                        layoutId="tab-pill"
                        transition={spring}
                        className="absolute inset-0 bg-primary rounded-full"
                      />
                    )}
                    <span className={`relative ${active ? "text-primary-foreground" : "text-white/80"}`}>
                      {t}
                    </span>
                    <ChevronDown
                      className={`relative w-3.5 h-3.5 transition-transform duration-300 ${
                        active ? "text-primary-foreground" : "text-white/70"
                      } ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {openTab && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 mt-2 z-30 min-w-[220px] glass border border-white/40 rounded-2xl shadow-2xl p-2 overflow-hidden"
                >
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {openTab} — Property type
                  </div>
                  {currentTypes.map((p, i) => (
                    <motion.button
                      key={p.value}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.2 }}
                      onClick={() => {
                        applyFilter(tab, p.value);
                        setOpenTab(null);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-foreground hover:bg-primary/10"
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div
          variants={stagger(0.15, 1.4)}
          initial="hidden"
          animate="show"
          className="mt-12 grid grid-cols-3 gap-6 sm:gap-12 max-w-3xl"
        >
          {metrics.map((m) => (
            <motion.div key={m.label} variants={fadeUp}>
              <div className="font-serif-display text-3xl sm:text-5xl font-semibold text-primary">
                <CountUp end={m.value} suffix={m.suffix} />
              </div>
              <div className="mt-1 text-xs sm:text-sm text-white/70 tracking-wide">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}