import { useSignUp } from "@clerk/react-router/legacy";
import { Button } from "@my-better-t-app/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@my-better-t-app/ui/components/card";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import { Building2, MailCheck, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { GoogleIcon } from "../components/google-icon";
import { getClerkErrorMessage } from "../lib/clerk-error";
import { createSiteMeta } from "../lib/site-meta";

export function meta({ location }: { location: { pathname: string } }) {
  return createSiteMeta({
    title: "Sign up — MT Operation Systems",
    description: "Create your MT Operation Systems account and start managing your organization.",
    path: location.pathname,
  });
}

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = submitting || googleLoading;

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setSubmitting(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Sign-up failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setSubmitting(true);
    try {
      const attempt = await signUp.attemptVerification({ strategy: "email_code", code });
      if (attempt.status === "complete" && setActive && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        navigate("/dashboard");
      } else {
        toast.error("Verification couldn't be completed — try again");
      }
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Verification failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      toast.error(getClerkErrorMessage(err, "Google sign-up failed"));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-100">
        <Card className="p-2">
          <CardHeader className="items-center gap-3 pb-2 text-center">
            <span className="brand-gradient flex size-11 items-center justify-center rounded-2xl text-white shadow-md shadow-purple-500/30">
              <Building2 className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                {step === "register" ? "Create your account" : "Check your email"}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {step === "register"
                  ? "Set up your organization on MT Operation Systems"
                  : `Enter the code we sent to ${email}`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {step === "register" ? (
              <>
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

                <form className="space-y-3" onSubmit={handleRegister}>
                  <div className="space-y-1.5">
                    <Label htmlFor="sign-up-email">Email address</Label>
                    <Input
                      id="sign-up-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sign-up-password">Password</Label>
                    <Input
                      id="sign-up-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    <UserPlus className="size-3.5" />
                    {submitting ? "Creating account…" : "Continue"}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="font-medium text-foreground hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <form className="space-y-3" onSubmit={handleVerify}>
                <div className="space-y-1.5">
                  <Label htmlFor="sign-up-code">Verification code</Label>
                  <Input
                    id="sign-up-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  <MailCheck className="size-3.5" />
                  {submitting ? "Verifying…" : "Verify email"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-muted-foreground hover:underline"
                  onClick={() => setStep("register")}
                >
                  Back
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Just exploring?{" "}
        <Link to="/sign-in" className="font-medium text-foreground hover:underline">
          Use a demo account instead
        </Link>
      </p>
    </div>
  );
}
