import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { spring } from "./motion";
import logo from "@/assets/logo.png";

const links = [
  { label: "Home", hash: "home" },
  { label: "About us", hash: "about" },
  { label: "Properties", hash: "properties" },
  { label: "Contact us", hash: "contact" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 200], [0, 1]);
  const bgOpacity = useTransform(scrollY, [0, 200], [0.15, 0.85]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.history.replaceState(null, "", `/#${hash}`);
    } else {
      navigate({ to: "/", hash });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={spring}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        style={{
          backgroundColor: useTransform(bgOpacity, (v) => `rgba(255,255,255,${v})`),
        }}
        className="backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
          {/* Logo */}
          <a href="/#home" onClick={goToSection("home")} className="flex items-center gap-2.5 group">
            <motion.img
              src={logo}
              alt="Luxria"
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={spring}
              className="h-16 md:h-20 w-auto"
            />
            <span className="font-serif-display text-2xl font-semibold tracking-[0.25em] text-foreground">
              LUXRIA
            </span>
          </a>

          {/* Center links */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.label}
                href={`/#${l.hash}`}
                onClick={goToSection(l.hash)}
                onMouseEnter={() => setHovered(l.label)}
                onMouseLeave={() => setHovered(null)}
                className="relative text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
              >
                {l.label}
                {hovered === l.label && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={spring}
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-primary"
                  />
                )}
              </a>
            ))}
          </nav>

          {/* WhatsApp */}
          <div className="hidden md:flex items-center">
            <Link
              to="/admin"
              className="hidden lg:inline-flex mr-4 text-xs font-semibold tracking-[0.2em] uppercase text-foreground/60 hover:text-primary transition-colors"
            >
              Admin
            </Link>
            <motion.a
              href="https://wa.me/23052521004"
              target="_blank"
              rel="noopener"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="relative inline-flex items-center gap-2 pl-3 pr-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-ping" />
              <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366]">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5s-.6-1.5-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.3-.6-.4M12 21.5c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3.4.9.9-3.3-.2-.3c-.9-1.4-1.4-3-1.4-4.7C3.1 7.7 7.1 3.7 12 3.7s8.9 4 8.9 8.9-4 8.9-8.9 8.9m7.6-16.5C17.6 3 14.9 1.9 12 1.9 6.1 1.9 1.3 6.7 1.3 12.6c0 1.9.5 3.7 1.4 5.3L1.2 23l5.3-1.4c1.5.8 3.3 1.3 5 1.3 5.9 0 10.7-4.8 10.7-10.7 0-2.9-1.1-5.6-3.1-7.6"/>
                </svg>
              </span>
              <span className="relative">Chat on WhatsApp</span>
            </motion.a>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <motion.div
          style={{ opacity: borderOpacity }}
          className="h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-md border-b border-primary/30 px-6 py-4 flex flex-col gap-3"
        >
          {links.map((l) => (
            <a key={l.label} href={`/#${l.hash}`} className="text-foreground/80 py-2" onClick={goToSection(l.hash)}>
              {l.label}
            </a>
          ))}
          <Link to="/admin" className="text-foreground/60 py-2 text-sm uppercase tracking-[0.2em]" onClick={() => setOpen(false)}>
            Admin
          </Link>
          <a
            href="https://wa.me/23052521004"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
          >
            Chat on WhatsApp
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}