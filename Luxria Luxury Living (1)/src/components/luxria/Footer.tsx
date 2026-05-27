import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { spring, fadeUp, stagger } from "./motion";
import logo from "@/assets/logo.png";

const columns = [
  { title: "Company", links: ["About us", "Our team", "Careers", "Press"] },
  { title: "Properties", links: ["Apartments", "Villas", "Penthouses", "Commercial"] },
  { title: "Resources", links: ["Buying guide", "Selling guide", "Market reports", "FAQ"] },
  { title: "Contact", links: ["Port Louis, MU", "+230 5252 1004", "hello@luxria.com"] },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{}}
          className="grid grid-cols-2 md:grid-cols-5 gap-10"
        >
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Luxria" className="h-9 w-auto" />
              <span className="font-serif-display text-xl tracking-[0.25em]">LUXRIA</span>
            </div>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Ultra-luxury real estate, simplified. Properties for the discerning few.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.15, color: "var(--color-primary)" }}
                  transition={spring}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/15 text-white/70"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {columns.map((col) => (
            <motion.div key={col.title} variants={fadeUp}>
              <h4 className="text-sm font-semibold text-primary uppercase tracking-widest">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/70 hover:text-primary transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{}}
          transition={{ ...spring, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50"
        >
          <p>© {new Date().getFullYear()} Luxria. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}