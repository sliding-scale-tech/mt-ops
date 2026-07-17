import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/react-router";
import { useSignIn } from "@clerk/react-router/legacy";
import { Button } from "@my-better-t-app/ui/components/button";
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import { FlaskConical, LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function meta() {
  return [{ title: "Sign in — MT Operation Systems" }];
}

const demoAccounts = [
  {
    label: "Admin demo",
    email: "dummyadmin@mtops.com",
    password: "dummyadmin321",
    blurb: "Review invoices, manage jobsites, invite users",
  },
  {
    label: "Worker demo",
    email: "dummyuser@mtops.com",
    password: "dummyuser321",
    blurb: "Upload invoices, track approvals",
  },
];

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const signInAsDemo = async (email: string, password: string) => {
    if (!isLoaded) return;
    setLoadingEmail(email);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        navigate("/dashboard");
      } else {
        toast.error("Demo sign-in didn't complete — try again");
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // @ts-expect-error Clerk error shape
            (err.errors?.[0]?.message ?? "Demo sign-in failed")
          : "Demo sign-in failed";
      toast.error(message);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      {/*
        Fixed min-height reserves the widget's footprint for the entire
        loading sequence (Clerk SDK bootstrap, then its own internal UI
        chunk fetch) so the demo-account card below never jumps — Clerk
        exposes no single "fully painted" event to key off of instead.
      */}
      <div className="flex min-h-[500px] w-full max-w-100 items-center justify-center">
        <ClerkLoading>
          <SignInSkeleton />
        </ClerkLoading>
        <ClerkLoaded>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </ClerkLoaded>
      </div>
      <div className="glass w-full max-w-100 rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="brand-gradient flex size-7 items-center justify-center rounded-lg text-white">
            <FlaskConical className="size-3.5" />
          </span>
          Just exploring? Try a demo account
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <div
              key={account.email}
              className="rounded-xl border border-white/50 bg-white/40 p-3 text-xs dark:border-white/10 dark:bg-white/5"
            >
              <div className="font-semibold">{account.label}</div>
              <div className="mt-1 font-mono text-[11px]">{account.email}</div>
              <div className="font-mono text-[11px]">{account.password}</div>
              <div className="mt-1 text-muted-foreground">{account.blurb}</div>
              <Button
                type="button"
                size="sm"
                className="mt-2 w-full"
                disabled={!isLoaded || loadingEmail !== null}
                onClick={() => signInAsDemo(account.email, account.password)}
              >
                <LogIn className="size-3.5" />
                {loadingEmail === account.email ? "Signing in..." : `Log in as ${account.label}`}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Demo data is sample-only and never saved.
        </p>
      </div>
    </div>
  );
}

/**
 * Reserves the same footprint as Clerk's <SignIn> widget while its JS
 * chunks are still loading, so the page below it doesn't jump once it
 * mounts.
 */
function SignInSkeleton() {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border bg-card">
      <div className="space-y-4 p-8">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-px flex-1" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="border-t p-4 text-center">
        <Skeleton className="mx-auto h-3 w-40" />
      </div>
    </div>
  );
}
