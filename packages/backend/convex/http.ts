import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data;
        const primaryEmail =
          data.email_addresses.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ?? data.email_addresses[0]?.email_address;
        if (!primaryEmail) break;
        const name =
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          undefined;
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email: primaryEmail,
          name,
          imageUrl: data.image_url ?? undefined,
        });
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: event.data.id,
          });
        }
        break;
      }
      default:
        break;
    }
    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(request: Request): Promise<WebhookEvent | null> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set on the Convex deployment");
  }
  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };
  try {
    return new Webhook(secret).verify(payload, headers) as WebhookEvent;
  } catch {
    return null;
  }
}

export default http;
