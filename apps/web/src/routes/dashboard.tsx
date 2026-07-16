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
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { toast } from "sonner";

import { AppSidebar } from "../components/app-sidebar";

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
  return (
    <>
      <AuthLoading>
        <FullPageLoader />
      </AuthLoading>
      <Unauthenticated>
        <Navigate to="/sign-in" replace />
      </Unauthenticated>
      <Authenticated>
        <Gateway />
      </Authenticated>
    </>
  );
}

function FullPageLoader() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/**
 * Ensures the Convex user record exists (and pending invites are applied),
 * then routes: admin → /admin, member → worker portal, no org → onboarding.
 */
function Gateway() {
  const ensureCurrent = useMutation(api.users.ensureCurrent);
  const [ensured, setEnsured] = useState(false);
  const me = useQuery(api.users.current);

  useEffect(() => {
    ensureCurrent({})
      .catch(() => {})
      .finally(() => setEnsured(true));
  }, [ensureCurrent]);

  if (!ensured || me === undefined) return <FullPageLoader />;
  if (!me || !me.orgId) return <Onboarding />;
  if (me.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="flex min-h-svh">
      <AppSidebar
        items={workerNav}
        name={me.name}
        email={me.email}
        orgName={me.org?.name}
      />
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
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
