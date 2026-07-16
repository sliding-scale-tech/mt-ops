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
import { useMutation, useQuery } from "convex/react";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WorkerSettings() {
  const me = useQuery(api.users.current);
  const updateName = useMutation(api.users.updateName);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me?.name) setName(me.name);
  }, [me?.name]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateName({ name });
      toast.success("Name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
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
          {me === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Display name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={me?.email ?? ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input value={me?.org?.name ?? "—"} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned jobsite</Label>
                <Input value={me?.jobsite?.name ?? "Not assigned"} disabled />
              </div>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
