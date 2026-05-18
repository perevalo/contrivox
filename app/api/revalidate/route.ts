import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");

  if (!process.env.NEXT_REVALIDATE_SECRET || secret !== process.env.NEXT_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: { model?: string; entry?: { slug?: string } };
  try { body = await req.json(); } catch { body = {}; }

  const model = body?.model;
  const slug  = body?.entry?.slug;

  revalidatePath("/blog");

  if (model === "post" && slug) {
    revalidatePath(`/blog/${slug}`);
  }

  if (model === "category") {
    revalidatePath("/blog/category/[slug]", "page");
  }

  revalidatePath("/sitemap.xml");

  return NextResponse.json({ revalidated: true, model, slug });
}
