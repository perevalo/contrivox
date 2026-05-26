#!/usr/bin/env tsx
/**
 * Publishes all generated but unpublished jurisdiction pages.
 *
 * Usage:
 *   pnpm exec tsx scripts/auto-publish-jurisdictions.ts
 *   pnpm exec tsx scripts/auto-publish-jurisdictions.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) console.log("DRY RUN — no changes will be written.\n");

  const db = getDb();

  const { data: raw, error } = await db
    .from("clause_jurisdictions")
    .select("clause_slug, jurisdiction_slug, jurisdiction_name")
    .not("generated_content", "is", null)
    .eq("published", false)
    .order("clause_slug");

  const pending = (raw as unknown as { clause_slug: string; jurisdiction_slug: string; jurisdiction_name: string }[]) ?? [];

  if (error) {
    console.error("✗ Failed to fetch:", error.message);
    process.exit(1);
  }

  if (pending.length === 0) {
    console.log("Nothing to publish — no generated jurisdiction pages pending.");
    return;
  }

  console.log(`${dryRun ? "Would publish" : "Publishing"} ${pending.length} jurisdiction page(s):\n`);
  pending.forEach((r) => console.log(`  • /clauses/${r.clause_slug}/${r.jurisdiction_slug}`));

  if (dryRun) {
    console.log("\nDry run complete — no changes made.");
    return;
  }

  const keys = pending.map((r) => ({ clause_slug: r.clause_slug, jurisdiction_slug: r.jurisdiction_slug }));

  // Publish in batches by clause_slug to avoid overly complex queries
  for (const key of keys) {
    const { error: updateErr } = await db
      .from("clause_jurisdictions")
      .update({ published: true })
      .eq("clause_slug", key.clause_slug)
      .eq("jurisdiction_slug", key.jurisdiction_slug);

    if (updateErr) {
      console.error(`  ✗ Failed to publish ${key.clause_slug}/${key.jurisdiction_slug}: ${updateErr.message}`);
    }
  }

  console.log(`\n✓ ${pending.length} jurisdiction page(s) published.`);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
