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
import { Label } from "@my-better-t-app/ui/components/label";
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DemoAdminSettings } from "../components/demo";
import { DEMO_ADMIN_EMAIL } from "../lib/demo";
import { formatDate } from "../lib/format";

function RealAdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Invite users to your organization and manage your team.
        </p>
      </div>
      <InviteCard />
      <PendingInvitesCard />
      <MembersCard />
    </div>
  );
}

function InviteCard() {
  const jobsites = useQuery(api.jobsites.list);
  const createInvite = useMutation(api.invites.create);
  const [email, setEmail] = useState("");
  const [jobsiteId, setJobsiteId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInvite({
        email,
        jobsiteId: jobsiteId ? (jobsiteId as Id<"jobsites">) : undefined,
      });
      toast.success(
        `Invited ${email.trim().toLowerCase()} — they'll be connected when they sign up with this email`,
      );
      setEmail("");
      setJobsiteId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          Invite a user
        </CardTitle>
        <CardDescription>
          No email is sent — when someone signs up with this address, they join
          your organization automatically. If they already signed up, they're
          connected immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="worker@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="min-w-44 space-y-2">
            <Label htmlFor="invite-jobsite">Assign jobsite (optional)</Label>
            <select
              id="invite-jobsite"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={jobsiteId}
              onChange={(e) => setJobsiteId(e.target.value)}
            >
              <option value="">No jobsite</option>
              {jobsites?.map((jobsite) => (
                <option key={jobsite._id} value={jobsite._id}>
                  {jobsite.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving || !email.trim()}>
            {saving ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PendingInvitesCard() {
  const invites = useQuery(api.invites.list);
  const revokeInvite = useMutation(api.invites.revoke);
  const pending = invites?.filter((invite) => invite.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invites</CardTitle>
        <CardDescription>
          Waiting for these people to sign up with their invited email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pending === undefined ? (
          <Skeleton className="h-16 w-full" />
        ) : pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pending invites.
          </p>
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
                {pending.map((invite) => (
                  <tr key={invite._id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {invite.email}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{invite.jobsite?.name ?? "—"}</td>
                    <td className="py-3 pr-4">{formatDate(invite._creationTime)}</td>
                    <td className="py-3 text-right">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        onClick={async () => {
                          try {
                            await revokeInvite({ id: invite._id });
                            toast.success("Invite revoked");
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : "Something went wrong",
                            );
                          }
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
  );
}

function MembersCard() {
  const members = useQuery(api.members.list);
  const jobsites = useQuery(api.jobsites.list);
  const setJobsite = useMutation(api.members.setJobsite);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>
          Everyone in your organization. Reassign jobsites here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members === undefined ? (
          <Skeleton className="h-16 w-full" />
        ) : (
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
                {members.map((member) => (
                  <tr key={member._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{member.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{member.email}</td>
                    <td className="py-3 pr-4 capitalize">{member.role}</td>
                    <td className="py-3">
                      {member.role === "admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <select
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                          value={member.jobsiteId ?? ""}
                          onChange={async (e) => {
                            try {
                              await setJobsite({
                                userId: member._id,
                                jobsiteId: e.target.value
                                  ? (e.target.value as Id<"jobsites">)
                                  : undefined,
                              });
                              toast.success("Jobsite updated");
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Something went wrong",
                              );
                            }
                          }}
                        >
                          <option value="">No jobsite</option>
                          {jobsites?.map((jobsite) => (
                            <option key={jobsite._id} value={jobsite._id}>
                              {jobsite.name}
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
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const gateMe = useQuery(api.users.current);
  if (gateMe === undefined) return null;
  if (gateMe?.email === DEMO_ADMIN_EMAIL) return <DemoAdminSettings />;
  return <RealAdminSettings />;
}
