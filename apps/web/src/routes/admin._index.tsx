import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Button } from "@my-better-t-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-better-t-app/ui/components/card";
import { Input } from "@my-better-t-app/ui/components/input";
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarCheck,
  Clock,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DemoAdminOverview } from "../components/demo";
import { DEMO_ADMIN_EMAIL } from "../lib/demo";
import { StatCard } from "../components/stat-card";
import { formatAmount } from "../lib/format";

function RealAdminOverview() {
  const members = useQuery(api.members.list);
  const invoices = useQuery(api.invoices.listForOrg);

  const workerCount = members?.filter((m) => m.role === "member").length;
  const totalInvoiced = invoices
    ?.filter((i) => i.status === "approved")
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const pendingCount = invoices?.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Track workers, invoices, and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Active Workers"
          value={workerCount ?? "…"}
          sub="Active on platform"
          icon={Users}
        />
        <StatCard
          title="Invoice Value"
          value={totalInvoiced === undefined ? "…" : formatAmount(totalInvoiced)}
          sub="Total approved amount"
          icon={FileText}
        />
        <StatCard
          title="Pending Invoices"
          value={pendingCount ?? "…"}
          icon={FileText}
          linkTo="/admin/invoices"
          linkLabel="Review now"
        />
        <StatCard
          title="Pending Holidays"
          value={0}
          sub="Coming soon"
          icon={CalendarCheck}
          muted
        />
        <StatCard
          title="Pending Timesheets"
          value={0}
          sub="Coming soon"
          icon={Clock}
          muted
        />
      </div>

      <JobsitesCard />
    </div>
  );
}

function JobsitesCard() {
  const jobsites = useQuery(api.jobsites.list);
  const createJobsite = useMutation(api.jobsites.create);
  const updateJobsite = useMutation(api.jobsites.update);
  const removeJobsite = useMutation(api.jobsites.remove);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [editingId, setEditingId] = useState<Id<"jobsites"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast.success(success);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return false;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Jobsites</CardTitle>
          <CardDescription>Manage jobsite options for workers.</CardDescription>
        </div>
        <Button onClick={() => setAdding((v) => !v)}>
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
          {adding ? "Cancel" : "Add jobsite"}
        </Button>
      </CardHeader>
      <CardContent>
        {adding && (
          <form
            className="mb-4 flex flex-wrap items-end gap-3 glass rounded-xl p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await run(
                () => createJobsite({ name: newName, address: newAddress }),
                "Jobsite added",
              );
              if (ok) {
                setNewName("");
                setNewAddress("");
                setAdding(false);
              }
            }}
          >
            <div className="min-w-40 flex-1">
              <Input
                placeholder="Name (e.g. FRA44)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="min-w-40 flex-1">
              <Input
                placeholder="Address (e.g. Frankfurt)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        )}

        {jobsites === undefined ? (
          <Skeleton className="h-24 w-full" />
        ) : jobsites.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No jobsites yet. Add your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Address</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobsites.map((jobsite) =>
                  editingId === jobsite._id ? (
                    <tr key={jobsite._id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Input
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                        />
                      </td>
                      <td className="py-2 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              const ok = await run(
                                () =>
                                  updateJobsite({
                                    id: jobsite._id,
                                    name: editName,
                                    address: editAddress,
                                  }),
                                "Jobsite updated",
                              );
                              if (ok) setEditingId(null);
                            }}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={jobsite._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{jobsite.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {jobsite.address || "—"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 rounded-full"
                            onClick={() => {
                              setEditingId(jobsite._id);
                              setEditName(jobsite.name);
                              setEditAddress(jobsite.address);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 rounded-full"
                            onClick={() => {
                              if (confirm(`Delete jobsite ${jobsite.name}?`)) {
                                void run(
                                  () => removeJobsite({ id: jobsite._id }),
                                  "Jobsite deleted",
                                );
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const gateMe = useQuery(api.users.current);
  if (gateMe === undefined) return null;
  if (gateMe?.email === DEMO_ADMIN_EMAIL) return <DemoAdminOverview />;
  return <RealAdminOverview />;
}
