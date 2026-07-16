import { SignIn } from "@clerk/react-router";
import { FlaskConical } from "lucide-react";

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
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
      <div className="glass w-full max-w-100 rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="brand-gradient flex size-7 items-center justify-center rounded-lg text-white">
            <FlaskConical className="size-3.5" />
          </span>
          Just exploring? Try a demo account
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <div key={account.email} className="rounded-xl border border-white/50 bg-white/40 p-3 text-xs dark:border-white/10 dark:bg-white/5">
              <div className="font-semibold">{account.label}</div>
              <div className="mt-1 font-mono text-[11px]">{account.email}</div>
              <div className="font-mono text-[11px]">{account.password}</div>
              <div className="mt-1 text-muted-foreground">{account.blurb}</div>
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
