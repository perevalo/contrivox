import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const err = new Error("Contrivox Sentry test event — server-side ✓");
  Sentry.captureException(err);
  await Sentry.flush(3000);

  return NextResponse.json({ ok: true, message: "Test event sent. Check Sentry Issues." });
}
