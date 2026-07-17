import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Navigate } from "react-router";

import { AnimatedOutlet, FadeSwap } from "../components/animated-outlet";
import { AppSidebar } from "../components/app-sidebar";
import { FullScreenLoader } from "../components/full-screen-loader";
import { useAuthGate } from "../hooks/use-auth-gate";
import { DEMO_ADMIN_EMAIL, DEMO_ORG_NAME } from "../lib/demo";

export function meta() {
  return [{ title: "Admin — MT Operation Systems" }];
}

const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "#", label: "Timesheets", icon: Clock, disabled: true },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "#", label: "Holidays", icon: CalendarDays, disabled: true },
  { to: "#", label: "Users", icon: Users, disabled: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export default function AdminLayout() {
  const authState = useAuthGate();
  if (authState === "unauthenticated") return <Navigate to="/sign-in" replace />;
  return <AdminGuard isAuthenticated={authState === "authenticated"} />;
}

/**
 * `loading` spans both auth settling and the profile query so the branded
 * loader stays a single continuous state instead of flashing between two
 * different loading screens.
 */
function AdminGuard({ isAuthenticated }: { isAuthenticated: boolean }) {
  const me = useQuery(api.users.current);
  const isDemo = me?.email === DEMO_ADMIN_EMAIL;
  const loading = !isAuthenticated || me === undefined;

  if (!loading && !isDemo && (!me || me.role !== "admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <FadeSwap stateKey={loading ? "loading" : "app"}>
      {loading ? (
        <FullScreenLoader label="Loading your workspace…" />
      ) : (
        <div className="flex min-h-svh">
          <AppSidebar
            items={adminNav}
            name={me?.name}
            email={me?.email ?? ""}
            orgName={isDemo ? DEMO_ORG_NAME : me?.org?.name}
          />
          <main className="min-w-0 flex-1 p-8">
            <AnimatedOutlet />
          </main>
        </div>
      )}
    </FadeSwap>
  );
}
