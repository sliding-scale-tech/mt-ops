import { SignUp } from "@clerk/react-router";

export function meta() {
  return [{ title: "Sign up — MT Operation Systems" }];
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
