import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

// Server-side PostHog client for use in API routes and webhooks.
// Uses flushAt:1 so events are sent immediately (important for short-lived serverless functions).
export function getPostHogServer(): PostHog {
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}
