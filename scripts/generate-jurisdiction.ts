#!/usr/bin/env tsx
/**
 * Generates AI content for unpublished clause × jurisdiction pages.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-jurisdiction.ts                     # all pending
 *   pnpm exec tsx scripts/generate-jurisdiction.ts non-compete-clause  # one clause, all jurisdictions
 *   pnpm exec tsx scripts/generate-jurisdiction.ts non-compete-clause california  # one specific page
 *   pnpm exec tsx scripts/generate-jurisdiction.ts --clause=garden-leave-clause  # flag form
 */

import { createClient } from "@supabase/supabase-js";
import { generateJurisdictionContent } from "../lib/generate-jurisdiction-content";
import type { ClauseSeed } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith("--"));
  const clauseFlag = args.find((a) => a.startsWith("--clause="))?.split("=")[1];

  const clauseTarget = positional[0] || clauseFlag || null;
  const jurisdictionTarget = positional[1] || null;

  const db = getDb();

  // Build query for pending rows
  let query = db
    .from("clause_jurisdictions")
    .select("clause_slug, jurisdiction_slug, jurisdiction_name")
    .is("generated_content", null)
    .order("clause_slug");

  if (clauseTarget) query = query.eq("clause_slug", clauseTarget);
  if (jurisdictionTarget) query = query.eq("jurisdiction_slug", jurisdictionTarget);

  const { data: pending, error: fetchErr } = await query;

  if (fetchErr) {
    console.error("✗ Query failed:", fetchErr.message);
    process.exit(1);
  }

  const rows = (pending as unknown as { clause_slug: string; jurisdiction_slug: string; jurisdiction_name: string }[]) ?? [];

  if (rows.length === 0) {
    console.log("Nothing to generate — all jurisdiction pages already have content.");
    return;
  }

  console.log(`Generating content for ${rows.length} jurisdiction page(s)...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Fetch base clause data
    const { data: clauseData } = await db
      .from("clauses")
      .select("slug, name, definition_seed, key_risks")
      .eq("slug", row.clause_slug)
      .single();

    const clause = clauseData as unknown as Pick<ClauseSeed, "slug" | "name" | "definition_seed" | "key_risks"> | null;

    if (!clause) {
      console.error(`  ✗ Base clause '${row.clause_slug}' not found in database`);
      failed++;
      continue;
    }

    process.stdout.write(`  [${i + 1}/${rows.length}] ${row.clause_slug}/${row.jurisdiction_slug}... `);

    try {
      const content = await generateJurisdictionContent(clause, row.jurisdiction_slug, row.jurisdiction_name);

      const { error: updateErr } = await db
        .from("clause_jurisdictions")
        .update({
          generated_content: content as unknown as Record<string, unknown>,
          generated_at: new Date().toISOString(),
        })
        .eq("clause_slug", row.clause_slug)
        .eq("jurisdiction_slug", row.jurisdiction_slug);

      if (updateErr) throw new Error(updateErr.message);

      console.log("✓");
      success++;
    } catch (err) {
      console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }

    if (i < rows.length - 1) await sleep(2000);
  }

  console.log(`\n${success} generated, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
