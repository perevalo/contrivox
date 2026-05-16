import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

// Per-route rate limiters
export const limiters = {
  analyse:     new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,  "1h"), prefix: "cvx:analyse" }),
  checkout:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1h"), prefix: "cvx:checkout" }),
  sendReport:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1h"), prefix: "cvx:send-report" }),
  webhook:     new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100,"1m"), prefix: "cvx:webhook" }),
};

export type LimiterKey = keyof typeof limiters;

export async function checkRateLimit(
  req: NextRequest,
  key: LimiterKey
): Promise<NextResponse | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { success, reset, remaining } = await limiters[key].limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Allow — attach remaining header for debugging
  console.log(`[rate-limit] ${key} ip=${ip} remaining=${remaining}`);
  return null;
}
