import { Building2 } from "lucide-react";
import { motion } from "motion/react";

/**
 * Branded animated loader for the "figuring out where you belong" gap
 * between sign-in and landing on a real page (auth settling, profile
 * fetch, org lookup). Kept as a single continuously-mounted component
 * across that whole sequence — see dashboard.tsx / admin.tsx — so it
 * never flashes between two different loading states.
 */
export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5">
      <div className="relative flex size-16 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-primary/40"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-primary/40"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        <motion.div
          className="brand-gradient relative flex size-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-purple-500/30"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Building2 className="size-7" />
        </motion.div>
      </div>
      <motion.p
        className="text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
