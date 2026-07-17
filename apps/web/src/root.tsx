import { ClerkProvider, useAuth } from "@clerk/react-router";
import { clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";

import "./index.css";
import { env } from "@my-better-t-app/env/web";
import { Toaster } from "@my-better-t-app/ui/components/sonner";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { AnimatedOutlet } from "./components/animated-outlet";
import { RouteProgress } from "./components/route-progress";
import { ThemeProvider } from "./components/theme-provider";
import { createSiteMeta } from "./lib/site-meta";

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()];

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args);

// Module-level singleton: creating this inside App() would spin up a new
// WebSocket + auth token fetch on every root re-render (e.g. every
// navigation, since rootAuthLoader's data changes), resetting every
// useQuery to "loading" and causing a visible flash back to skeletons.
const convex = new ConvexReactClient(env.VITE_CONVEX_URL);

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/logo.webp", type: "image/webp" },
  { rel: "apple-touch-icon", href: "/logo.webp" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function meta({ location }: Route.MetaArgs) {
  return createSiteMeta({ path: location.pathname });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          <RouteProgress />
          <div className="app-gradient min-h-svh">
            <AnimatedOutlet instant />
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
