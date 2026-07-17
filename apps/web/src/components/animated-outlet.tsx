import { AnimatePresence, motion } from "motion/react";
import { useLocation, useOutlet } from "react-router";

/**
 * Drop-in replacement for react-router's <Outlet /> that fades + slides the
 * new route in whenever the pathname changes, instead of an abrupt DOM
 * swap. Safe to nest — each layout's own <AnimatedOutlet /> only reacts to
 * its own children changing.
 */
export function AnimatedOutlet({
  instant = false,
}: {
  /**
   * Skip the exit animation so the incoming route never waits behind an
   * outgoing one. Use for the root-level outlet: internal auth redirects
   * (e.g. /dashboard silently bouncing an admin to /admin) swap the route
   * without any user action, and both sides are often the same full-screen
   * loader — a sequential fade-out-then-in there reads as a blank flash,
   * not a transition.
   */
  instant?: boolean;
}) {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={instant ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Same fade for a piece of loading/content state that isn't router-driven
 * (e.g. a skeleton swapping for real content once a query resolves).
 * `stateKey` should change whenever the visible state changes.
 */
export function FadeSwap({
  stateKey,
  children,
}: {
  stateKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stateKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
