import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const client = Sentry.getClient();

  const err = new Error("Contrivox Sentry test event — server-side ✓");
  Sentry.captureException(err);
  const flushed = await Sentry.flush(3000);

  return NextResponse.json({
    ok: true,
    diagnostics: {
      dsn_set: !!dsn,
      client_initialized: !!client,
      flush_success: flushed,
    },
  });
}
