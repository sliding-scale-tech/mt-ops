import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

export type AuthGateState = "loading" | "authenticated" | "unauthenticated";

/**
 * Right after a fresh Clerk sign-in, Convex briefly reports isAuthenticated:
 * false while it exchanges Clerk's session for its own JWT. Routing that
 * blip straight to a <Navigate to="/sign-in"> causes a visible bounce
 * between the sign-in page and the destination route (Clerk's SignIn widget
 * then immediately redirects back since a session already exists). Only
 * treat "unauthenticated" as final once it has held for a short window.
 */
export function useAuthGate(): AuthGateState {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [state, setState] = useState<AuthGateState>("loading");

  useEffect(() => {
    if (isLoading) {
      setState("loading");
      return;
    }
    if (isAuthenticated) {
      setState("authenticated");
      return;
    }
    const timer = setTimeout(() => setState("unauthenticated"), 1000);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return state;
}
