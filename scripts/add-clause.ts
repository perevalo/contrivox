#!/usr/bin/env tsx
/**
 * Interactively add a new clause to the database.
 *
 * Usage: pnpm seo:add
 *
 * Prompts for: name, slug, category, definition_seed, key_risks (one per line).
 * Then optionally generates content immediately.
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";
import { generateClauseContent } from "../lib/generate-clause-content";
import type { ClauseSeed } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing env vars — run: tsx --env-file=.env.local scripts/add-clause.ts"
    );
  return createClient(url, key);
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nAdd a new clause to Contrivox SEO\n" + "─".repeat(40) + "\n");

  const name = (await ask(rl, "Clause name (e.g. Earn-Out Clause): ")).trim();
  if (!name) { rl.close(); console.log("Aborted — name is required."); return; }

  const suggestedSlug = toSlug(name);
  const slugInput = (await ask(rl, `Slug [${suggestedSlug}]: `)).trim();
  const slug = slugInput || suggestedSlug;

  const categories = ["employment", "freelance", "commercial", "ip", "general"];
  const catInput = (await ask(rl, `Category (${categories.join(" | ")}): `)).trim().toLowerCase();
  const category = (categories.includes(catInput) ? catInput : "general") as ClauseSeed["category"];

  const tierInput = (await ask(rl, "Search volume tier (high | medium | low) [medium]: ")).trim().toLowerCase();
  const tier = ["high", "medium", "low"].includes(tierInput) ? tierInput : "medium";

  const definitionSeed = (await ask(rl, "Definition seed (1-2 sentences): ")).trim();

  console.log("\nEnter key risks one per line. Empty line to finish:");
  const keyRisks: string[] = [];
  while (true) {
    const risk = (await ask(rl, `  Risk ${keyRisks.length + 1}: `)).trim();
    if (!risk) break;
    keyRisks.push(risk);
  }

  console.log("\nEnter related clause slugs one per line. Empty line to finish:");
  const relatedSlugs: string[] = [];
  while (true) {
    const rel = (await ask(rl, `  Slug: `)).trim();
    if (!rel) break;
    relatedSlugs.push(rel);
  }

  console.log("\nEnter also-known-as aliases one per line. Empty line to finish:");
  const aliases: string[] = [];
  while (true) {
    const alias = (await ask(rl, `  Alias: `)).trim();
    if (!alias) break;
    aliases.push(alias);
  }

  const generateNow = (await ask(rl, "\nGenerate content immediately? (y/n) [y]: "))
    .trim()
    .toLowerCase();
  const shouldGenerate = generateNow !== "n";

  rl.close();

  const db = getDb();

  const newClause = {
    slug,
    name,
    also_known_as: aliases,
    category,
    search_volume_tier: tier as "high" | "medium" | "low",
    definition_seed: definitionSeed,
    key_risks: keyRisks,
    related_clause_slugs: relatedSlugs,
    jurisdictions: ["us-general"],
  };

  console.log("\nInserting clause…");
  const { error } = await db
    .from("clauses")
    .upsert(newClause, { onConflict: "slug", ignoreDuplicates: false });

  if (error) {
    console.error("✗ Insert failed:", error.message);
    process.exit(1);
  }
  console.log(`  ✓ Clause "${name}" (${slug}) saved.`);

  if (shouldGenerate) {
    if (!definitionSeed || keyRisks.length === 0) {
      console.log("  ⚠  Skipping generation — definition_seed or key_risks are empty.");
    } else {
      console.log("\nGenerating content…");
      try {
        const content = await generateClauseContent(newClause);
        await db
          .from("clauses")
          .update({ generated_content: content, generated_at: new Date().toISOString() })
          .eq("slug", slug);
        console.log(`  ✓ Content generated for ${slug}.`);
        console.log("  Run `pnpm seo:review` to review and publish.");
      } catch (err) {
        console.error("  ✗ Generation failed:", err instanceof Error ? err.message : String(err));
      }
    }
  }

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
