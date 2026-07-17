import { useUser } from "@clerk/react-router";
import { Button } from "@my-better-t-app/ui/components/button";
import { Building2, FileText, Users } from "lucide-react";
import { Link, Navigate } from "react-router";

import type { Route } from "./+types/_index";
import { createSiteMeta } from "../lib/site-meta";

export function meta({ location, matches }: Route.MetaArgs) {
  return createSiteMeta({ path: location.pathname, matches });
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="glass sticky top-0 z-10 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white shadow-md shadow-purple-500/30">
            <Building2 className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">MT-OPERATION</div>
            <div className="text-xs text-muted-foreground">Systems</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="sm" className="px-2 sm:px-3" nativeButton={false} render={<Link to="/sign-in" />}>
            Sign in
          </Button>
          <Button size="sm" className="px-2 sm:px-3" nativeButton={false} render={<Link to="/sign-up" />}>Get started</Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Run your organization's operations in <span className="brand-gradient bg-clip-text text-transparent">one place</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Create your organization, add jobsites, invite your team, and manage
          field operations — invoices, timesheets, and more — from a single
          dashboard.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link to="/sign-up" />}>
            Create your organization
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link to="/sign-in" />}>
            Sign in
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Building2,
              title: "Organizations",
              text: "Spin up your org and manage jobsites.",
            },
            {
              icon: Users,
              title: "Invite your team",
              text: "Invited members connect automatically on signup.",
            },
            {
              icon: FileText,
              title: "Operations hub",
              text: "Run invoices, timesheets, holidays, and jobsite workflows in one place.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass rounded-2xl p-5 text-left">
              <span className="brand-gradient flex size-9 items-center justify-center rounded-full text-white shadow-md shadow-purple-500/30">
                <Icon className="size-4" />
              </span>
              <div className="mt-3 font-semibold">{title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{text}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
