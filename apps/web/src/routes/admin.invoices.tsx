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
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mail,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StatCard } from "../components/stat-card";
import { StatusBadge } from "../components/status-badge";
import { formatAmount, formatDate, formatMonth } from "../lib/format";

type Status = "pending" | "approved" | "rejected";

export default function AdminInvoices() {
  const invoices = useQuery(api.invoices.listForOrg);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const pending = invoices?.filter((i) => i.status === "pending") ?? [];
  const counts = {
    all: invoices?.length,
    pending: invoices?.filter((i) => i.status === "pending").length,
    approved: invoices?.filter((i) => i.status === "approved").length,
    rejected: invoices?.filter((i) => i.status === "rejected").length,
  };
  const filtered =
    invoices === undefined
      ? undefined
      : filter === "all"
        ? invoices
        : invoices.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">Review invoices and manage approvals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="All" value={counts.all ?? "…"} icon={FileText} />
        <StatCard title="Pending" value={counts.pending ?? "…"} icon={Clock} />
        <StatCard title="Approved" value={counts.approved ?? "…"} icon={CheckCircle2} />
        <StatCard title="Rejected" value={counts.rejected ?? "…"} icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Invoices awaiting review</CardDescription>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {pending.length} pending
          </span>
        </CardHeader>
        <CardContent>
          {invoices === undefined ? (
            <Skeleton className="h-24 w-full" />
          ) : pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending approvals.
            </p>
          ) : (
            <InvoiceTable invoices={pending} showSubmitted />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Review and manage submitted invoices</CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Filter
            <select
              className="rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </CardHeader>
        <CardContent>
          {filtered === undefined ? (
            <Skeleton className="h-24 w-full" />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices found.
            </p>
          ) : (
            <InvoiceTable invoices={filtered} showStatus />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type InvoiceRow = {
  _id: Id<"invoices">;
  _creationTime: number;
  month: string;
  amount?: number;
  fileName: string;
  fileUrl: string | null;
  status: Status;
  worker: { name?: string; email: string } | null;
  jobsite: { name: string } | null;
};

function InvoiceTable({
  invoices,
  showStatus,
  showSubmitted,
}: {
  invoices: InvoiceRow[];
  showStatus?: boolean;
  showSubmitted?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Worker</th>
            <th className="py-2 pr-4 font-medium">Job Site</th>
            <th className="py-2 pr-4 font-medium">Month</th>
            <th className="py-2 pr-4 font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">File</th>
            {showSubmitted && <th className="py-2 pr-4 font-medium">Submitted</th>}
            {showStatus && <th className="py-2 pr-4 font-medium">Status</th>}
            <th className="py-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <div className="font-medium">{invoice.worker?.name ?? "Unknown"}</div>
                {invoice.worker?.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    {invoice.worker.email}
                  </div>
                )}
              </td>
              <td className="py-3 pr-4">{invoice.jobsite?.name ?? "—"}</td>
              <td className="py-3 pr-4">{formatMonth(invoice.month)}</td>
              <td className="py-3 pr-4">{formatAmount(invoice.amount)}</td>
              <td className="py-3 pr-4">
                {invoice.fileUrl ? (
                  <a
                    href={invoice.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-44 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    <Download className="size-3.5 shrink-0" />
                    <span className="truncate">{invoice.fileName}</span>
                  </a>
                ) : (
                  "—"
                )}
              </td>
              {showSubmitted && (
                <td className="py-3 pr-4">{formatDate(invoice._creationTime)}</td>
              )}
              {showStatus && (
                <td className="py-3 pr-4">
                  <StatusBadge status={invoice.status} />
                </td>
              )}
              <td className="py-3">
                <InvoiceAction id={invoice._id} status={invoice.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceAction({ id, status }: { id: Id<"invoices">; status: Status }) {
  const setStatus = useMutation(api.invoices.setStatus);

  const update = async (next: Status) => {
    if (next === status) return;
    try {
      await setStatus({ id, status: next });
      toast.success(
        next === "approved"
          ? "Invoice approved"
          : next === "rejected"
            ? "Invoice rejected"
            : "Invoice set back to pending",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "pending") {
    return (
      <div className="inline-flex gap-2">
        <Button size="sm" onClick={() => update("approved")}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => update("rejected")}>
          Reject
        </Button>
      </div>
    );
  }

  return (
    <select
      className="rounded-lg border bg-background px-3 py-1.5 text-sm"
      value={status}
      onChange={(e) => update(e.target.value as Status)}
    >
      <option value="approved">Approve</option>
      <option value="rejected">Reject</option>
      <option value="pending">Pending</option>
    </select>
  );
}
