#!/usr/bin/env tsx
/**
 * Interactive review queue for generated clause content.
 * Lists all clauses that have content but haven't been reviewed/published yet.
 *
 * Usage: pnpm seo:review
 *
 * For each clause, shows:
 *  - H1, intro paragraph, first red flag
 * Then prompts: [p]ublish / [s]kip / [q]uit
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";
import type { ClauseContent } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing env vars — run: tsx --env-file=.env.local scripts/review-queue.ts"
    );
  return createClient(url, key);
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function hr() {
  console.log("\n" + "─".repeat(70));
}

async function main() {
  const db = getDb();

  const { data: clauses, error } = await db
    .from("clauses")
    .select("slug, name, generated_content, content_reviewed, published")
    .not("generated_content", "is", null)
    .eq("content_reviewed", false)
    .order("name");

  if (error) {
    console.error("✗ Failed to fetch review queue:", error.message);
    process.exit(1);
  }

  if (!clauses || clauses.length === 0) {
    console.log("Review queue is empty — nothing to review.");
    console.log("Run `pnpm seo:generate` first, or check content_reviewed status.");
    return;
  }

  console.log(`\n${clauses.length} clause(s) awaiting review.\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let published = 0;
  let skipped = 0;

  for (const clause of clauses) {
    const c = clause.generated_content as ClauseContent;
    const firstFlag = c.risks_and_red_flags?.[0];

    hr();
    console.log(`\nSLUG:   ${clause.slug}`);
    console.log(`H1:     ${c.h1}`);
    console.log(`\nINTRO:\n${c.intro_paragraph}`);
    if (firstFlag) {
      console.log(`\nFIRST RED FLAG: ${firstFlag.flag}`);
      console.log(firstFlag.explanation);
    }
    console.log(`\nFAQs:    ${c.faqs?.length ?? 0} items`);
    console.log(`TIPS:    ${c.negotiation_tips?.length ?? 0} items`);
    console.log(`CTA:     ${c.cta_hook}`);

    const answer = await ask(
      rl,
      "\n[p]ublish / [s]kip / [q]uit  › "
    );
    const choice = answer.trim().toLowerCase();

    if (choice === "q") {
      console.log("\nExiting review queue.");
      break;
    }

    if (choice === "p") {
      const { error: updateErr } = await db
        .from("clauses")
        .update({ content_reviewed: true, published: true })
        .eq("slug", clause.slug);

      if (updateErr) {
        console.error(`  ✗ Failed to publish ${clause.slug}:`, updateErr.message);
      } else {
        console.log(`  ✓ Published: ${clause.slug}`);
        published++;
      }
    } else {
      console.log(`  — Skipped: ${clause.slug}`);
      skipped++;
    }
  }

  rl.close();

  hr();
  console.log(`\nReview complete. ✓ ${published} published, — ${skipped} skipped.\n`);
  if (published > 0) {
    console.log("Vercel will pick up the new pages on next deploy.");
    console.log("For immediate effect: trigger a redeploy or wait for ISR revalidation.");
  }
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
