#!/usr/bin/env tsx
/**
 * CI-friendly alternative to the interactive review-queue.ts.
 * Publishes all clauses that have generated_content but haven't been reviewed yet.
 *
 * Usage (GitHub Actions / CI):
 *   tsx scripts/auto-publish.ts
 *   tsx scripts/auto-publish.ts --dry-run   # preview without writing
 */

import { createClient } from "@supabase/supabase-js";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) console.log("DRY RUN — no changes will be written.\n");

  const db = getDb();

  const { data: raw, error } = await db
    .from("clauses")
    .select("slug, name")
    .not("generated_content", "is", null)
    .eq("content_reviewed", false)
    .eq("published", false)
    .order("name");

  const pending = (raw as unknown as { slug: string; name: string }[]) ?? [];
  const fetchErr = error as { message?: string } | null;

  if (fetchErr) {
    console.error("✗ Failed to fetch pending clauses:", fetchErr.message ?? String(fetchErr));
    process.exit(1);
  }

  if (pending.length === 0) {
    console.log("Nothing to publish — no clauses with unreviewed generated content.");
    console.log("Run seo:generate first, or check that content_reviewed = false.");
    return;
  }

  console.log(`${dryRun ? "Would publish" : "Publishing"} ${pending.length} clause(s):\n`);
  pending.forEach((c) => console.log(`  • ${c.slug}`));

  if (dryRun) {
    console.log("\nDry run complete — no changes made.");
    return;
  }

  const { error: updateErr } = await db
    .from("clauses")
    .update({ content_reviewed: true, published: true })
    .in("slug", pending.map((c) => c.slug));

  const updateError = updateErr as { message?: string } | null;
  if (updateError) {
    console.error("\n✗ Publish failed:", updateError.message ?? String(updateError));
    process.exit(1);
  }

  console.log(`\n✓ ${pending.length} clause(s) published successfully.`);
  console.log("Pages will be live on the next Vercel deploy or within the ISR window.");
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
