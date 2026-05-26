import { NextRequest, NextResponse } from "next/server";
import { analyseContract, AppError, type FilePayload } from "@/lib/claude";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyseInputSchema, ALLOWED_MIME_TYPES } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel: allow up to 60s for Claude

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const limited = await checkRateLimit(req, "analyse");
  if (limited) return limited;

  // 2. Parse + validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let input: ReturnType<typeof analyseInputSchema.parse>;
  try {
    input = analyseInputSchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 422 });
    }
    return NextResponse.json({ error: "Validation error" }, { status: 422 });
  }

  // 3. Server-side MIME type check
  if (input.mediaType && !ALLOWED_MIME_TYPES.has(input.mediaType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }

  // 4. Build payload for Claude
  let payload: FilePayload;
  if (input.fileType === "image" && input.mediaType) {
    payload = { type: "image", data: input.fileData, mediaType: input.mediaType };
  } else if (input.fileType === "pdf") {
    payload = { type: "pdf", data: input.fileData };
  } else if (input.fileType === "text" && input.text) {
    payload = { type: "text", text: input.text };
  } else {
    return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
  }

  // 5. Call Claude
  try {
    const analysis = await analyseContract(payload);
    return NextResponse.json({ analysis });
  } catch (e) {
    if (e instanceof AppError) {
      const messages: Record<string, string> = {
        rate_limited: "Claude API rate limit reached. Please try again in a moment.",
        overloaded:   "Our AI is temporarily overloaded. Please try again shortly.",
        parse_error:  "Could not parse the analysis result. Please try again.",
        api_error:    "AI service error. Please try again.",
      };
      return NextResponse.json(
        { error: messages[e.code] ?? "Analysis failed. Please try again." },
        { status: e.status }
      );
    }
    console.error("[analyse] unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
