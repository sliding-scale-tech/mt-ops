import { AuthenticateWithRedirectCallback } from "@clerk/react-router";

import { FullScreenLoader } from "../components/full-screen-loader";

export function meta() {
  return [{ title: "Signing in — MT Operation Systems" }];
}

export default function SSOCallback() {
  return (
    <>
      <FullScreenLoader label="Finishing sign-in…" />
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    </>
  );
}
