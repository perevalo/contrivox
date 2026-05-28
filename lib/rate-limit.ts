import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

let _redis: Redis | null = null;
let _limiters: ReturnType<typeof buildLimiters> | null = null;

function buildLimiters(redis: Redis) {
  return {
    analyse:        new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1h"),  prefix: "cvx:analyse" }),
    contractCreate: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20,  "1h"),  prefix: "cvx:contract-create" }),
    contractStatus: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "1h"),  prefix: "cvx:contract-status" }),
    checkout:       new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1h"),  prefix: "cvx:checkout" }),
    sendReport: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20,  "1h"), prefix: "cvx:send-report" }),
    subscribe:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1h"), prefix: "cvx:subscribe" }),
    checklist:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1h"), prefix: "cvx:checklist" }),
    contact:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1h"), prefix: "cvx:contact" }),
    webhook:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1m"), prefix: "cvx:webhook" }),
    revalidate: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20,  "1m"), prefix: "cvx:revalidate" }),
  };
}

function getLimiters() {
  if (!_limiters) {
    _redis = Redis.fromEnv();
    _limiters = buildLimiters(_redis);
  }
  return _limiters;
}

export type LimiterKey = keyof ReturnType<typeof buildLimiters>;

export async function checkRateLimit(
  req: NextRequest,
  key: LimiterKey
): Promise<NextResponse | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { success, reset, remaining } = await getLimiters()[key].limit(ip);

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

  return null;
}
