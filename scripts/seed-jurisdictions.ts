#!/usr/bin/env tsx
/**
 * Seeds high-value clause × jurisdiction combinations into clause_jurisdictions table.
 * Run AFTER the migration and seed-more-clauses have been applied.
 *
 * Usage: pnpm exec tsx scripts/seed-jurisdictions.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { JurisdictionSeed } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

const JURISDICTION_SEEDS: JurisdictionSeed[] = [
  // ── non-compete — highest search volume ───────────────────────────────────
  { clause_slug: "non-compete-clause", jurisdiction_slug: "california",      jurisdiction_name: "California" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "new-york",        jurisdiction_name: "New York" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "texas",           jurisdiction_name: "Texas" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "florida",         jurisdiction_name: "Florida" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "illinois",        jurisdiction_name: "Illinois" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "united-kingdom",  jurisdiction_name: "United Kingdom" },
  { clause_slug: "non-compete-clause", jurisdiction_slug: "australia",       jurisdiction_name: "Australia" },

  // ── NDA ───────────────────────────────────────────────────────────────────
  { clause_slug: "nda-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "nda-clause", jurisdiction_slug: "new-york",       jurisdiction_name: "New York" },
  { clause_slug: "nda-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "nda-clause", jurisdiction_slug: "european-union", jurisdiction_name: "European Union" },

  // ── arbitration ───────────────────────────────────────────────────────────
  { clause_slug: "arbitration-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "arbitration-clause", jurisdiction_slug: "new-york",       jurisdiction_name: "New York" },
  { clause_slug: "arbitration-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },

  // ── IP assignment ─────────────────────────────────────────────────────────
  { clause_slug: "ip-assignment-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "ip-assignment-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "ip-assignment-clause", jurisdiction_slug: "european-union", jurisdiction_name: "European Union" },

  // ── at-will employment ────────────────────────────────────────────────────
  { clause_slug: "at-will-employment-clause", jurisdiction_slug: "california", jurisdiction_name: "California" },
  { clause_slug: "at-will-employment-clause", jurisdiction_slug: "new-york",   jurisdiction_name: "New York" },
  { clause_slug: "at-will-employment-clause", jurisdiction_slug: "texas",      jurisdiction_name: "Texas" },

  // ── garden leave — primarily UK ───────────────────────────────────────────
  { clause_slug: "garden-leave-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "garden-leave-clause", jurisdiction_slug: "australia",      jurisdiction_name: "Australia" },

  // ── non-solicitation ──────────────────────────────────────────────────────
  { clause_slug: "non-solicitation-clause", jurisdiction_slug: "california", jurisdiction_name: "California" },
  { clause_slug: "non-solicitation-clause", jurisdiction_slug: "new-york",   jurisdiction_name: "New York" },
  { clause_slug: "non-solicitation-clause", jurisdiction_slug: "texas",      jurisdiction_name: "Texas" },

  // ── severance ─────────────────────────────────────────────────────────────
  { clause_slug: "severance-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "severance-clause", jurisdiction_slug: "new-york",       jurisdiction_name: "New York" },
  { clause_slug: "severance-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },

  // ── confidentiality ───────────────────────────────────────────────────────
  { clause_slug: "confidentiality-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "confidentiality-clause", jurisdiction_slug: "european-union", jurisdiction_name: "European Union" },
  { clause_slug: "confidentiality-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },

  // ── termination ───────────────────────────────────────────────────────────
  { clause_slug: "termination-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "termination-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },

  // ── indemnification ───────────────────────────────────────────────────────
  { clause_slug: "indemnification-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "indemnification-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },

  // ── work for hire / IP ────────────────────────────────────────────────────
  { clause_slug: "work-for-hire-clause",      jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "work-for-hire-clause",      jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "work-made-for-hire-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },

  // ── liquidated damages ────────────────────────────────────────────────────
  { clause_slug: "liquidated-damages-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
  { clause_slug: "liquidated-damages-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },

  // ── renewal / auto-renewal ────────────────────────────────────────────────
  { clause_slug: "renewal-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "renewal-clause", jurisdiction_slug: "european-union", jurisdiction_name: "European Union" },

  // ── data ownership ────────────────────────────────────────────────────────
  { clause_slug: "data-ownership-clause", jurisdiction_slug: "european-union", jurisdiction_name: "European Union" },
  { clause_slug: "data-ownership-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },

  // ── attorneys fees ────────────────────────────────────────────────────────
  { clause_slug: "attorneys-fees-clause", jurisdiction_slug: "california",     jurisdiction_name: "California" },
  { clause_slug: "attorneys-fees-clause", jurisdiction_slug: "united-kingdom", jurisdiction_name: "United Kingdom" },
];

async function main() {
  const db = getDb();

  console.log(`Seeding ${JURISDICTION_SEEDS.length} clause × jurisdiction combinations...\n`);

  const { error } = await db
    .from("clause_jurisdictions")
    .upsert(JURISDICTION_SEEDS, { onConflict: "clause_slug, jurisdiction_slug", ignoreDuplicates: true });

  if (error) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ ${JURISDICTION_SEEDS.length} jurisdiction rows seeded.`);
  console.log("  Run generate-jurisdiction.ts to generate AI content for each.");
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
