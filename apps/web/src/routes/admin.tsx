import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import {
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Navigate, Outlet } from "react-router";

import { AppSidebar } from "../components/app-sidebar";

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
  return (
    <>
      <AuthLoading>
        <AdminSkeleton />
      </AuthLoading>
      <Unauthenticated>
        <Navigate to="/sign-in" replace />
      </Unauthenticated>
      <Authenticated>
        <AdminGuard />
      </Authenticated>
    </>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function AdminGuard() {
  const me = useQuery(api.users.current);
  if (me === undefined) return <AdminSkeleton />;
  if (!me || me.role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-svh">
      <AppSidebar
        items={adminNav}
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
