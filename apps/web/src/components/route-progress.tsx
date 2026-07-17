import { AnimatePresence, motion } from "motion/react";
import { useNavigation } from "react-router";

/**
 * Slim top-of-page progress bar tied to React Router's real navigation
 * state, so it only appears when a route transition actually has async
 * work in flight (loaders, our root auth loader) rather than on every
 * client-side render.
 */
export function RouteProgress() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[60] h-0.5"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          <motion.div
            className="brand-gradient h-full origin-left shadow-[0_0_8px_rgba(124,58,237,0.6)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.85, transition: { duration: 1.1, ease: "easeOut" } }}
            exit={{ scaleX: 1, transition: { duration: 0.2, ease: "easeIn" } }}
            style={{ transformOrigin: "left" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
