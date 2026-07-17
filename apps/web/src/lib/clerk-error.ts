export function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "errors" in err) {
    // @ts-expect-error Clerk error shape
    return err.errors?.[0]?.message ?? fallback;
  }
  return fallback;
}
