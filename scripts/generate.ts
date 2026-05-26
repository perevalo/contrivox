#!/usr/bin/env tsx
/**
 * Generate AI page content for clauses that have no generated_content yet.
 *
 * Usage:
 *   pnpm seo:generate                          — all ungenerated clauses
 *   pnpm seo:generate non-compete-clause       — one specific slug
 *   pnpm seo:generate --category employment    — all in a category
 *   pnpm seo:generate --all                    — force-regenerate even if content exists
 *
 * Rate-limited to 1 request per 2 seconds to avoid API throttling.
 */

import { createClient } from "@supabase/supabase-js";
import { generateClauseContent } from "../lib/generate-clause-content";
import type { ClauseSeed } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing env vars — run: tsx --env-file=.env.local scripts/generate.ts"
    );
  return createClient(url, key);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const forceAll   = args.includes("--all");
  const catIdx     = args.indexOf("--category");
  const category   = catIdx !== -1 ? args[catIdx + 1] : null;
  const targetSlug = args.find((a) => !a.startsWith("--") && a !== category);

  const db = getDb();

  let query = db.from("clauses").select(
    "slug, name, also_known_as, category, search_volume_tier, " +
    "definition_seed, key_risks, related_clause_slugs, jurisdictions, generated_content"
  );

  if (targetSlug)         query = query.eq("slug", targetSlug);
  else if (category)      query = query.eq("category", category);

  if (!forceAll && !targetSlug) {
    query = query.is("generated_content", null);
  }

  const { data: rawClauses, error } = await query;
  type ClauseForGen = ClauseSeed & { generated_content: unknown };
  const clauses = rawClauses as unknown as ClauseForGen[] | null;
  const queryError = error as { message?: string } | null;

  if (queryError) {
    console.error("✗ Failed to fetch clauses:", queryError.message ?? String(queryError));
    process.exit(1);
  }

  if (!clauses || clauses.length === 0) {
    console.log("Nothing to generate — all matching clauses already have content.");
    console.log("Use --all to force-regenerate.");
    return;
  }

  console.log(`Generating content for ${clauses.length} clause(s)…\n`);

  let succeeded = 0;
  let failed = 0;

  for (const clause of clauses) {
    if (!clause.definition_seed) {
      console.log(`  ⚠  skipping ${clause.slug} — no definition_seed`);
      continue;
    }

    const start = Date.now();
    try {
      const content = await generateClauseContent(clause);

      const { error: updateError } = await db
        .from("clauses")
        .update({
          generated_content: content as unknown as Record<string, unknown>,
          generated_at: new Date().toISOString(),
        })
        .eq("slug", clause.slug);

      if (updateError) throw new Error((updateError as { message?: string }).message ?? "update failed");

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`  ✓  generated: ${clause.slug} (${elapsed}s)`);
      succeeded++;
    } catch (err) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  failed:    ${clause.slug} (${elapsed}s) — ${msg}`);
      failed++;
    }

    // Rate limit: 1 request per 2 seconds
    if (clauses.indexOf(clause) < clauses.length - 1) {
      await sleep(2000);
    }
  }

  console.log(`\nDone. ✓ ${succeeded} generated, ✗ ${failed} failed.`);
  if (succeeded > 0) {
    console.log(`\nNext step: pnpm seo:review`);
  }
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
