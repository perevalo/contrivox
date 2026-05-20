import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { ZodError } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { contractCreateSchema, ALLOWED_MIME_TYPES } from "@/lib/validation";
import { buildDummyAnalysis } from "@/lib/dummy-analysis";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "contractCreate");
  if (limited) return limited;

  let input: ReturnType<typeof contractCreateSchema.parse>;
  try {
    input = contractCreateSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 422 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Server-side MIME check
  if (input.mediaType && !ALLOWED_MIME_TYPES.has(input.mediaType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }

  const sessionId = randomUUID();
  const supabase  = createSupabaseServiceClient();

  let fileStoragePath: string | null = null;

  if (input.fileType !== "text" && input.fileData) {
    const ext  = input.fileName.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `pending/${sessionId}.${ext}`;
    const buf  = Buffer.from(input.fileData, "base64");

    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(path, buf, {
        contentType: input.mediaType ?? "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[contract/create] storage upload:", uploadError.message);
      return NextResponse.json({ error: "File upload failed" }, { status: 502 });
    }

    fileStoragePath = path;
  }

  const ip     = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const { error: dbError } = await supabase.from("contracts").insert({
    session_id:        sessionId,
    file_name:         input.fileName,
    file_type:         input.fileType,
    media_type:        input.mediaType ?? null,
    file_storage_path: fileStoragePath,
    file_text:         input.fileText ?? null,
    lang_code:         input.langCode,
    status:            "pending",
    ip_hash:           ipHash,
  });

  if (dbError) {
    console.error("[contract/create] db insert:", dbError.message);
    return NextResponse.json({ error: "Failed to save contract" }, { status: 502 });
  }

  return NextResponse.json({
    sessionId,
    dummyAnalysis: buildDummyAnalysis(input.langCode),
  });
}
