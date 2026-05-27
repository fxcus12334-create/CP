import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const LETTERS = "LUXRIA".split("");

export default function SplashScreen({ triggerKey }: { triggerKey?: string } = {}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
    }, 2600);
    return () => clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-white"
        >
          {/* Soft radial glow — gentle pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.85], scale: [0.8, 1.05, 1] }}
            transition={{ duration: 2.2, ease: "easeOut", times: [0, 0.6, 1] }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(201,168,76,0.22) 0%, rgba(255,255,255,0) 60%)",
            }}
          />

          {/* Subtle film grain via noise overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative mb-6"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity, delay: 1.4 }}
              >
                <img
                  src={logo}
                  alt="Luxria"
                  className="h-56 md:h-72 w-auto drop-shadow-[0_10px_30px_rgba(201,168,76,0.4)]"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.7, 0.4], scale: [0.4, 1.1, 1] }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.35), transparent 70%)" }}
              />
            </motion.div>

            {/* Top hairline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.05 }}
              className="mb-8 h-px w-[260px] origin-left bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"
            />

            {/* Wordmark — letter by letter */}
            <div className="relative flex items-end overflow-hidden">
              {LETTERS.map((letter, i) => (
                <span key={i} className="overflow-hidden inline-block">
                  <motion.span
                    initial={{ y: "115%", opacity: 0, filter: "blur(8px)" }}
                    animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.55 + i * 0.09,
                    }}
                    className="inline-block font-serif-display text-[64px] md:text-[88px] leading-[0.95] font-light tracking-[0.32em] text-[#0a0a0a]"
                  >
                    {letter}
                  </motion.span>
                </span>
              ))}

              {/* Gold shimmer sweep across the wordmark */}
              <motion.div
                initial={{ x: "-120%", opacity: 0 }}
                animate={{ x: "120%", opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 1.4 }}
                className="pointer-events-none absolute inset-y-0 w-1/3"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 0%, rgba(201,168,76,0.55) 50%, transparent 100%)",
                  mixBlendMode: "screen",
                  filter: "blur(6px)",
                }}
              />
            </div>

            {/* Tagline */}
            <div className="mt-6 overflow-hidden">
              <motion.span
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.5 }}
                className="block text-[10px] tracking-[0.5em] text-black/50"
              >
                ULTRA — LUXURY  ·  REAL ESTATE
              </motion.span>
            </div>

            {/* Bottom hairline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.05 }}
              className="mt-8 h-px w-[260px] origin-right bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"
            />

            {/* Progress bar */}
            <motion.div className="mt-10 h-px w-[120px] overflow-hidden bg-black/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 0.6 }}
                className="h-full w-full bg-[#c9a84c]"
              />
            </motion.div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}