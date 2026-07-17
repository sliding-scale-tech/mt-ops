import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Button } from "@my-better-t-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-better-t-app/ui/components/card";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { AnimatedOutlet, FadeSwap } from "../components/animated-outlet";
import { AppSidebar } from "../components/app-sidebar";
import { FullScreenLoader } from "../components/full-screen-loader";
import { useAuthGate } from "../hooks/use-auth-gate";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ORG_NAME,
  DEMO_WORKER_EMAIL,
} from "../lib/demo";

export function meta() {
  return [{ title: "Dashboard — MT Operation Systems" }];
}

const workerNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "#", label: "Timesheets", icon: Clock, disabled: true },
  { to: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { to: "#", label: "Holidays", icon: CalendarDays, disabled: true },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export default function DashboardLayout() {
  const authState = useAuthGate();
  if (authState === "unauthenticated") return <Navigate to="/sign-in" replace />;
  return <Gateway isAuthenticated={authState === "authenticated"} />;
}

/**
 * Ensures the Convex user record exists (and pending invites are applied),
 * then routes: admin → /admin, member → worker portal, no org → onboarding.
 * `loading` (auth still settling, ensureCurrent in flight, or the profile
 * query still pending) stays a single continuous state so the branded
 * loader never flashes between two different loading screens.
 */
function Gateway({ isAuthenticated }: { isAuthenticated: boolean }) {
  const ensureCurrent = useMutation(api.users.ensureCurrent);
  const [ensured, setEnsured] = useState(false);
  const me = useQuery(api.users.current);

  useEffect(() => {
    if (!isAuthenticated) return;
    ensureCurrent({})
      .catch(() => {})
      .finally(() => setEnsured(true));
  }, [ensureCurrent, isAuthenticated]);

  const loading = !isAuthenticated || !ensured || me === undefined;

  if (loading) {
    return (
      <FadeSwap stateKey="loading">
        <FullScreenLoader label="Signing you in…" />
      </FadeSwap>
    );
  }
  if (me?.email === DEMO_ADMIN_EMAIL) return <Navigate to="/admin" replace />;
  const isDemo = me?.email === DEMO_WORKER_EMAIL;
  if (!isDemo) {
    if (!me || !me.orgId) {
      return (
        <FadeSwap stateKey="onboarding">
          <Onboarding />
        </FadeSwap>
      );
    }
    if (me.role === "admin") return <Navigate to="/admin" replace />;
  }

  return (
    <FadeSwap stateKey="app">
      <div className="flex min-h-svh">
        <AppSidebar
          items={workerNav}
          name={me?.name}
          email={me?.email ?? ""}
          orgName={isDemo ? DEMO_ORG_NAME : me?.org?.name}
        />
        <main className="min-w-0 flex-1 p-8">
          <AnimatedOutlet />
        </main>
      </div>
    </FadeSwap>
  );
}

function Onboarding() {
  const createOrg = useMutation(api.organizations.create);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrg({ name });
      toast.success("Organization created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white">
              <Building2 className="size-4" />
            </span>
            Create your organization
          </CardTitle>
          <CardDescription>
            You're not part of an organization yet. Create one to become its
            admin — or, if your admin invited this email, it will connect
            automatically the next time you open this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                placeholder="e.g. C2BM Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
              {saving ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
