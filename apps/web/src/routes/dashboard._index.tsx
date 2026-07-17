import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Button } from "@my-better-t-app/ui/components/button";
import { useQuery } from "convex/react";
import { CalendarDays, Clock, FileText, MapPin, Upload } from "lucide-react";
import { Link } from "react-router";

import { DemoWorkerOverview } from "../components/demo";
import { DEMO_WORKER_EMAIL } from "../lib/demo";
import { StatCard } from "../components/stat-card";

function RealWorkerOverview() {
  const me = useQuery(api.users.current);
  const invoices = useQuery(api.invoices.listMine);

  const pending = invoices?.filter((i) => i.status === "pending").length;
  const approved = invoices?.filter((i) => i.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Welcome{me?.name ? `, ${me.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            {me?.org?.name ? `You're part of ${me.org.name}. ` : ""}
            {me?.jobsite?.name ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> Assigned jobsite: {me.jobsite.name}
              </span>
            ) : (
              "No jobsite assigned yet — your admin can assign one."
            )}
          </p>
        </div>
        <Button nativeButton={false} render={<Link to="/dashboard/invoices" />} className="w-full sm:w-auto">
          <Upload className="size-4" />
          Upload invoice
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Invoices"
          value={invoices?.length ?? "…"}
          sub={
            invoices === undefined
              ? undefined
              : `${pending} pending · ${approved} approved`
          }
          icon={FileText}
          linkTo="/dashboard/invoices"
          linkLabel="View invoices"
        />
        <StatCard
          title="Timesheets"
          value="—"
          sub="Coming soon"
          icon={Clock}
          muted
        />
        <StatCard
          title="Holidays"
          value="—"
          sub="Coming soon"
          icon={CalendarDays}
          muted
        />
      </div>
    </div>
  );
}

export default function WorkerOverview() {
  const gateMe = useQuery(api.users.current);
  if (gateMe === undefined) return null;
  if (gateMe?.email === DEMO_WORKER_EMAIL) return <DemoWorkerOverview />;
  return <RealWorkerOverview />;
}
