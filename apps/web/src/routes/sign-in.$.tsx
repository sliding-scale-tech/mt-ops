import { SignIn } from "@clerk/react-router";

export function meta() {
  return [{ title: "Sign in — MT Operation Systems" }];
}

export default function SignInPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
