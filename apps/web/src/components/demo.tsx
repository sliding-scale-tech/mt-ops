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
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FileUp,
  FlaskConical,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserPlus,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import {
  currentMonth,
  formatAmount,
  formatDate,
  formatMonth,
} from "../lib/format";
import {
  DEMO_ORG_NAME,
  DEMO_WORKER_EMAIL,
  DEMO_WORKER_ID,
  demoId,
  useDemoStore,
  type DemoInvoiceStatus,
  type DemoState,
} from "../lib/demo";
import { StatCard } from "./stat-card";
import { StatusBadge } from "./status-badge";

export function DemoBanner() {
  return (
    <div className="glass mb-6 flex items-center gap-3 rounded-2xl border-amber-300/60 px-4 py-3 text-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
        <FlaskConical className="size-4" />
      </span>
      <div>
        <span className="font-semibold">Demo mode.</span>{" "}
        <span className="text-muted-foreground">
          This is sample data for exploring the platform — changes stay in this
          tab only and are never saved.
        </span>
      </div>
    </div>
  );
}

function jobsiteName(state: DemoState, id?: string) {
  return state.jobsites.find((j) => j.id === id)?.name ?? "—";
}

function demoFileClick() {
  toast.info("Demo document — no real file behind this one");
}

/* ------------------------------- Admin ------------------------------- */

export function DemoAdminOverview() {
  const { state, update } = useDemoStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const workers = state.members.filter((m) => m.role === "member").length;
  const totalApproved = state.invoices
    .filter((i) => i.status === "approved")
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const pending = state.invoices.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Track workers, invoices, and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Active Workers" value={workers} sub="Active on platform" icon={Users} />
        <StatCard title="Invoice Value" value={formatAmount(totalApproved)} sub="Total approved amount" icon={FileText} />
        <StatCard title="Pending Invoices" value={pending} icon={FileText} linkTo="/admin/invoices" linkLabel="Review now" />
        <StatCard title="Pending Holidays" value={0} sub="Paid feature" icon={CalendarCheck} muted />
        <StatCard title="Pending Timesheets" value={0} sub="Paid feature" icon={Clock} muted />
      </div>

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
              className="glass mb-4 flex flex-wrap items-end gap-3 rounded-xl p-4"
              onSubmit={(e) => {
                e.preventDefault();
                update((d) => {
                  d.jobsites.push({ id: demoId("j"), name: newName.trim(), address: newAddress.trim() });
                });
                toast.success("Jobsite added (demo)");
                setNewName("");
                setNewAddress("");
                setAdding(false);
              }}
            >
              <div className="min-w-40 flex-1">
                <Input placeholder="Name (e.g. FRA44)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div className="min-w-40 flex-1">
                <Input placeholder="Address (e.g. Frankfurt)" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <Button type="submit">Save</Button>
            </form>
          )}
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
                {state.jobsites.map((jobsite) =>
                  editingId === jobsite.id ? (
                    <tr key={jobsite.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </td>
                      <td className="py-2 pr-4">
                        <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                      </td>
                      <td className="py-2 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              update((d) => {
                                const j = d.jobsites.find((x) => x.id === jobsite.id);
                                if (j) {
                                  j.name = editName.trim();
                                  j.address = editAddress.trim();
                                }
                              });
                              toast.success("Jobsite updated (demo)");
                              setEditingId(null);
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
                    <tr key={jobsite.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{jobsite.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{jobsite.address || "—"}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 rounded-full"
                            onClick={() => {
                              setEditingId(jobsite.id);
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
                              update((d) => {
                                d.jobsites = d.jobsites.filter((x) => x.id !== jobsite.id);
                                for (const m of d.members) {
                                  if (m.jobsiteId === jobsite.id) m.jobsiteId = undefined;
                                }
                              });
                              toast.success("Jobsite deleted (demo)");
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
        </CardContent>
      </Card>
    </div>
  );
}

export function DemoAdminInvoices() {
  const { state, update } = useDemoStore();
  const [filter, setFilter] = useState<"all" | DemoInvoiceStatus>("all");

  const setStatus = (id: string, status: DemoInvoiceStatus) => {
    update((d) => {
      const invoice = d.invoices.find((i) => i.id === id);
      if (invoice) invoice.status = status;
    });
    toast.success(
      status === "approved" ? "Invoice approved (demo)" : status === "rejected" ? "Invoice rejected (demo)" : "Set back to pending (demo)",
    );
  };

  const pending = state.invoices.filter((i) => i.status === "pending");
  const filtered = filter === "all" ? state.invoices : state.invoices.filter((i) => i.status === filter);
  const counts = {
    all: state.invoices.length,
    pending: pending.length,
    approved: state.invoices.filter((i) => i.status === "approved").length,
    rejected: state.invoices.filter((i) => i.status === "rejected").length,
  };

  const row = (invoice: (typeof state.invoices)[number], showStatus: boolean, showSubmitted: boolean) => {
    const member = state.members.find((m) => m.id === invoice.memberId);
    return (
      <tr key={invoice.id} className="border-b last:border-0">
        <td className="py-3 pr-4">
          <div className="font-medium">
            {invoice.memberId === DEMO_WORKER_ID ? state.workerName : member?.name ?? "Unknown"}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="size-3" />
            {member?.email}
          </div>
        </td>
        <td className="py-3 pr-4">{jobsiteName(state, invoice.jobsiteId)}</td>
        <td className="py-3 pr-4">{formatMonth(invoice.month)}</td>
        <td className="py-3 pr-4">{formatAmount(invoice.amount)}</td>
        <td className="py-3 pr-4">
          <button
            type="button"
            onClick={demoFileClick}
            className="inline-flex max-w-44 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
          >
            <Download className="size-3.5 shrink-0" />
            <span className="truncate">{invoice.fileName}</span>
          </button>
        </td>
        {showSubmitted && <td className="py-3 pr-4">{formatDate(invoice.submittedAt)}</td>}
        {showStatus && (
          <td className="py-3 pr-4">
            <StatusBadge status={invoice.status} />
          </td>
        )}
        <td className="py-3">
          {invoice.status === "pending" ? (
            <div className="inline-flex gap-2">
              <Button size="sm" onClick={() => setStatus(invoice.id, "approved")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(invoice.id, "rejected")}>
                Reject
              </Button>
            </div>
          ) : (
            <select
              className="rounded-lg border bg-background px-3 py-1.5 text-sm"
              value={invoice.status}
              onChange={(e) => setStatus(invoice.id, e.target.value as DemoInvoiceStatus)}
            >
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
              <option value="pending">Pending</option>
            </select>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">Review invoices and manage approvals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="All" value={counts.all} icon={FileText} />
        <StatCard title="Pending" value={counts.pending} icon={Clock} />
        <StatCard title="Approved" value={counts.approved} icon={CheckCircle2} />
        <StatCard title="Rejected" value={counts.rejected} icon={XCircle} />
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
          {pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending approvals.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Worker</th>
                    <th className="py-2 pr-4 font-medium">Job Site</th>
                    <th className="py-2 pr-4 font-medium">Month</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">File</th>
                    <th className="py-2 pr-4 font-medium">Submitted</th>
                    <th className="py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>{pending.map((i) => row(i, false, true))}</tbody>
              </table>
            </div>
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
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Worker</th>
                    <th className="py-2 pr-4 font-medium">Job Site</th>
                    <th className="py-2 pr-4 font-medium">Month</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">File</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>{filtered.map((i) => row(i, true, false))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DemoAdminSettings() {
  const { state, update } = useDemoStore();
  const [email, setEmail] = useState("");
  const [jobsiteId, setJobsiteId] = useState("");

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Invite users to your organization and manage your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white">
              <UserPlus className="size-4" />
            </span>
            Invite a user
          </CardTitle>
          <CardDescription>
            No email is sent — when someone signs up with this address, they
            join your organization automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              update((d) => {
                d.invites.push({
                  id: demoId("inv"),
                  email: email.trim().toLowerCase(),
                  jobsiteId: jobsiteId || undefined,
                  invitedAt: Date.now(),
                });
              });
              toast.success(`Invited ${email.trim().toLowerCase()} (demo)`);
              setEmail("");
              setJobsiteId("");
            }}
          >
            <div className="min-w-56 flex-1 space-y-2">
              <Label htmlFor="demo-invite-email">Email address</Label>
              <Input
                id="demo-invite-email"
                type="email"
                placeholder="worker@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="min-w-44 space-y-2">
              <Label htmlFor="demo-invite-jobsite">Assign jobsite (optional)</Label>
              <select
                id="demo-invite-jobsite"
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                value={jobsiteId}
                onChange={(e) => setJobsiteId(e.target.value)}
              >
                <option value="">No jobsite</option>
                {state.jobsites.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={!email.trim()}>
              Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
          <CardDescription>
            Waiting for these people to sign up with their invited email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.invites.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Jobsite</th>
                    <th className="py-2 pr-4 font-medium">Invited</th>
                    <th className="py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.invites.map((invite) => (
                    <tr key={invite.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3.5 text-muted-foreground" />
                          {invite.email}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{jobsiteName(state, invite.jobsiteId)}</td>
                      <td className="py-3 pr-4">{formatDate(invite.invitedAt)}</td>
                      <td className="py-3 text-right">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 rounded-full"
                          onClick={() => {
                            update((d) => {
                              d.invites = d.invites.filter((x) => x.id !== invite.id);
                            });
                            toast.success("Invite revoked (demo)");
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>
            Everyone in your organization. Reassign jobsites here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 font-medium">Jobsite</th>
                </tr>
              </thead>
              <tbody>
                {state.members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {member.id === DEMO_WORKER_ID ? state.workerName : member.name}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{member.email}</td>
                    <td className="py-3 pr-4 capitalize">{member.role}</td>
                    <td className="py-3">
                      {member.role === "admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <select
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                          value={member.jobsiteId ?? ""}
                          onChange={(e) => {
                            update((d) => {
                              const m = d.members.find((x) => x.id === member.id);
                              if (m) m.jobsiteId = e.target.value || undefined;
                            });
                            toast.success("Jobsite updated (demo)");
                          }}
                        >
                          <option value="">No jobsite</option>
                          {state.jobsites.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------- Worker ------------------------------- */

export function DemoWorkerOverview() {
  const { state } = useDemoStore();
  const mine = state.invoices.filter((i) => i.memberId === DEMO_WORKER_ID);
  const me = state.members.find((m) => m.id === DEMO_WORKER_ID);

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {state.workerName}
          </h1>
          <p className="text-muted-foreground">
            You're part of {DEMO_ORG_NAME}.{" "}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> Assigned jobsite:{" "}
              {jobsiteName(state, me?.jobsiteId)}
            </span>
          </p>
        </div>
        <Button nativeButton={false} render={<Link to="/dashboard/invoices" />}>
          <Upload className="size-4" />
          Upload invoice
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Invoices"
          value={mine.length}
          sub={`${mine.filter((i) => i.status === "pending").length} pending · ${mine.filter((i) => i.status === "approved").length} approved`}
          icon={FileText}
          linkTo="/dashboard/invoices"
          linkLabel="View invoices"
        />
        <StatCard title="Timesheets" value="—" sub="Paid feature" icon={Clock} muted />
        <StatCard title="Holidays" value="—" sub="Paid feature" icon={CalendarCheck} muted />
      </div>
    </div>
  );
}

export function DemoWorkerInvoices() {
  const { state, update } = useDemoStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [amount, setAmount] = useState("");

  const mine = state.invoices
    .filter((i) => i.memberId === DEMO_WORKER_ID)
    .sort((a, b) => b.submittedAt - a.submittedAt);
  const me = state.members.find((m) => m.id === DEMO_WORKER_ID);

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Upload your invoice and track its approval status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white">
              <FileUp className="size-4" />
            </span>
            Submit an invoice
          </CardTitle>
          <CardDescription>Upload your invoice document. Amount is optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!file) {
                toast.error("Choose a document to upload");
                return;
              }
              const parsedAmount = amount.trim() ? Number(amount) : undefined;
              if (parsedAmount !== undefined && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
                toast.error("Enter a valid amount");
                return;
              }
              update((d) => {
                d.invoices.unshift({
                  id: demoId("i"),
                  memberId: DEMO_WORKER_ID,
                  jobsiteId: me?.jobsiteId,
                  month,
                  amount: parsedAmount,
                  fileName: file.name,
                  submittedAt: Date.now(),
                  status: "pending",
                });
              });
              toast.success("Invoice submitted for approval (demo — not saved)");
              setFile(null);
              setAmount("");
              if (fileInput.current) fileInput.current.value = "";
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="demo-invoice-file">Document</Label>
              <Input
                id="demo-invoice-file"
                ref={fileInput}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-invoice-month">Month</Label>
              <Input
                id="demo-invoice-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-invoice-amount">Amount (optional)</Label>
              <Input
                id="demo-invoice-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1250.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!file}>
                Submit invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My invoices</CardTitle>
          <CardDescription>Track the status of your submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Month</th>
                  <th className="py-2 pr-4 font-medium">Job Site</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">File</th>
                  <th className="py-2 pr-4 font-medium">Submitted</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{formatMonth(invoice.month)}</td>
                    <td className="py-3 pr-4">{jobsiteName(state, invoice.jobsiteId)}</td>
                    <td className="py-3 pr-4">{formatAmount(invoice.amount)}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={demoFileClick}
                        className="inline-flex max-w-40 items-center gap-1 truncate text-primary hover:underline"
                      >
                        <Download className="size-3.5 shrink-0" />
                        <span className="truncate">{invoice.fileName}</span>
                      </button>
                    </td>
                    <td className="py-3 pr-4">{formatDate(invoice.submittedAt)}</td>
                    <td className="py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DemoWorkerSettings() {
  const { state, update } = useDemoStore();
  const [name, setName] = useState(state.workerName);
  const me = state.members.find((m) => m.id === DEMO_WORKER_ID);

  return (
    <div className="max-w-2xl space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white">
              <UserRound className="size-4" />
            </span>
            Profile
          </CardTitle>
          <CardDescription>
            Your display name is shown to your organization's admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update((d) => {
                d.workerName = name.trim();
              });
              toast.success("Name updated (demo)");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="demo-profile-name">Display name</Label>
              <Input
                id="demo-profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={DEMO_WORKER_EMAIL} disabled />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input value={DEMO_ORG_NAME} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned jobsite</Label>
              <Input value={jobsiteName(state, me?.jobsiteId)} disabled />
            </div>
            <Button type="submit" disabled={!name.trim()}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
