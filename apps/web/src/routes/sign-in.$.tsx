import { useSignIn } from "@clerk/react-router/legacy";
import { Button } from "@my-better-t-app/ui/components/button";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import { Building2, FlaskConical, LogIn } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { GoogleIcon } from "../components/google-icon";
import { getClerkErrorMessage } from "../lib/clerk-error";
import { createSiteMeta } from "../lib/site-meta";

export function meta({ location }: { location: { pathname: string } }) {
  return createSiteMeta({
    title: "Sign in — MT Operation Systems",
    description: "Sign in to MT Operation Systems to manage operations, jobsites, and your team.",
    path: location.pathname,
  });
}

const demoAccounts = [
  {
    label: "Admin demo",
    email: "dummyadmin@mtops.com",
    password: "dummyadmin321",
    blurb: "Oversee operations, jobsites, and invite users",
  },
  {
    label: "Worker demo",
    email: "dummyuser@mtops.com",
    password: "dummyuser321",
    blurb: "Run field operations and track approvals",
  },
];

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const busy = submitting || googleLoading || loadingEmail !== null;

  const finishSignIn = async (createdSessionId: string | null) => {
    if (!setActive || !createdSessionId) return;
    await setActive({ session: createdSessionId });
    navigate("/dashboard");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setSubmitting(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await finishSignIn(attempt.createdSessionId);
      } else {
        toast.error("Sign-in couldn't be completed — try again");
      }
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Sign-in failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Google sign-in failed"));
      setGoogleLoading(false);
    }
  };

  const signInAsDemo = async (demoEmail: string, demoPassword: string) => {
    if (!isLoaded) return;
    setLoadingEmail(demoEmail);
    try {
      const attempt = await signIn.create({ identifier: demoEmail, password: demoPassword });
      if (attempt.status === "complete") {
        await finishSignIn(attempt.createdSessionId);
      } else {
        toast.error("Demo sign-in didn't complete — try again");
      }
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Demo sign-in failed"));
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4 sm:p-6">
      <div className="glass w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg shadow-purple-500/10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <section className="bg-card/70 p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <span className="brand-gradient flex size-11 items-center justify-center rounded-2xl text-white shadow-md shadow-purple-500/30">
                <Building2 className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                  Sign in to MT Operation Systems
                </h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Welcome back! Please sign in to continue
                </p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={handleGoogle}
              >
                <GoogleIcon className="size-4" />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="sign-in-email">Email address</Label>
                  <Input
                    id="sign-in-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sign-in-password">Password</Label>
                  <Input
                    id="sign-in-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  <LogIn className="size-3.5" />
                  {submitting ? "Signing in…" : "Continue"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/sign-up" className="font-medium text-foreground hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </section>

          <section className="flex flex-col border-t border-white/40 bg-white/25 p-6 sm:p-8 lg:border-t-0 lg:border-l dark:border-white/10 dark:bg-white/5">
            <div className="mb-5 flex items-start gap-3">
              <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-purple-500/30">
                <FlaskConical className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold sm:text-base">Just exploring?</h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Jump in with a demo account — no signup needed.
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {demoAccounts.map((account) => (
                <div
                  key={account.email}
                  className="flex flex-1 flex-col rounded-xl border border-white/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="font-semibold">{account.label}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {account.email}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {account.password}
                  </div>
                  <p className="mt-2 flex-1 text-xs text-muted-foreground">{account.blurb}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full bg-background/80"
                    disabled={!isLoaded || busy}
                    onClick={() => signInAsDemo(account.email, account.password)}
                  >
                    <LogIn className="size-3.5" />
                    {loadingEmail === account.email
                      ? "Signing in..."
                      : `Log in as ${account.label}`}
                  </Button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Demo data is sample-only and never saved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
