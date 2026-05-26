#!/usr/bin/env tsx
/**
 * Generates SEO-optimised blog articles that link to clause pages.
 * Saves each article as a markdown file in content/blog/.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-blog-articles.ts              # all articles
 *   pnpm exec tsx scripts/generate-blog-articles.ts freelance    # one article by slug keyword
 *   pnpm exec tsx scripts/generate-blog-articles.ts --force      # overwrite existing files
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type ArticleSpec = {
  slug: string;
  title: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: string;
  angle: string;
  clauseLinks: Record<string, string>; // "Clause Name" → "/clauses/slug"
  targetWordCount: number;
};

const ARTICLES: ArticleSpec[] = [
  {
    slug: "how-to-review-freelance-contract",
    title: "How to Review a Freelance Contract: 10 Clauses You Must Read Before Signing",
    metaDescription: "Before you sign any freelance contract, check these 10 critical clauses. Plain-English guide to scope, payment, IP, and red flags — with what to negotiate.",
    primaryKeyword: "how to review a freelance contract",
    secondaryKeywords: ["freelance contract clauses", "freelance agreement checklist", "what to look for in a freelance contract"],
    category: "Freelance",
    angle: "Step-by-step guide for freelancers who just received a client contract. Practical and actionable — what each clause means, what's a red flag, and what to ask for instead.",
    clauseLinks: {
      "Scope of Work Clause": "/clauses/scope-of-work-clause",
      "Payment Terms Clause": "/clauses/payment-terms-clause",
      "IP Assignment Clause": "/clauses/ip-assignment-clause",
      "Confidentiality Clause": "/clauses/confidentiality-clause",
      "Limitation of Liability Clause": "/clauses/limitation-of-liability-clause",
      "Termination Clause": "/clauses/termination-clause",
      "Kill Fee Clause": "/clauses/kill-fee-clause",
      "Revision Policy Clause": "/clauses/revision-policy-clause",
      "Deliverables Clause": "/clauses/deliverables-clause",
      "Late Payment Penalty Clause": "/clauses/late-payment-penalty-clause",
    },
    targetWordCount: 2200,
  },
  {
    slug: "employment-contract-red-flags",
    title: "Employment Contract Red Flags: 8 Warning Signs Lawyers Watch For",
    metaDescription: "Signing an employment contract? Lawyers flag these 8 clauses before their clients sign. Non-competes, IP grabs, clawbacks, and more explained in plain English.",
    primaryKeyword: "employment contract red flags",
    secondaryKeywords: ["employment contract warning signs", "what to look for in employment contract", "employment agreement red flags"],
    category: "Employment",
    angle: "Consumer-facing guide from the employee's perspective. What a lawyer would flag before their client signs. Covers the 8 most dangerous clauses in employment contracts, with concrete examples of bad vs. acceptable language.",
    clauseLinks: {
      "Non-Compete Clause": "/clauses/non-compete-clause",
      "Non-Solicitation Clause": "/clauses/non-solicitation-clause",
      "IP Assignment Clause": "/clauses/ip-assignment-clause",
      "At-Will Employment Clause": "/clauses/at-will-employment-clause",
      "Non-Disparagement Clause": "/clauses/non-disparagement-clause",
      "Clawback Clause": "/clauses/clawback-clause",
      "Garden Leave Clause": "/clauses/garden-leave-clause",
      "Severance Clause": "/clauses/severance-clause",
    },
    targetWordCount: 2000,
  },
  {
    slug: "is-non-compete-enforceable",
    title: "Is a Non-Compete Clause Enforceable? A State-by-State Guide (2026)",
    metaDescription: "Non-compete enforceability varies dramatically by state. California bans them almost entirely. Texas enforces them strictly. Here's the full breakdown for 2026.",
    primaryKeyword: "is non compete clause enforceable",
    secondaryKeywords: ["non compete enforceability by state", "non compete clause california", "are non competes enforceable"],
    category: "Contract Clauses",
    angle: "The definitive reference guide for workers and employers. Covers the FTC's attempted ban, state-by-state rules, and what makes a non-compete enforceable vs. void. Links to jurisdiction-specific pages for the most important states.",
    clauseLinks: {
      "Non-Compete Clause": "/clauses/non-compete-clause",
      "Non-Compete in California": "/clauses/non-compete-clause/california",
      "Non-Compete in New York": "/clauses/non-compete-clause/new-york",
      "Non-Compete in Texas": "/clauses/non-compete-clause/texas",
      "Non-Compete in Florida": "/clauses/non-compete-clause/florida",
      "Non-Compete in the UK": "/clauses/non-compete-clause/united-kingdom",
      "Garden Leave Clause": "/clauses/garden-leave-clause",
      "Non-Solicitation Clause": "/clauses/non-solicitation-clause",
    },
    targetWordCount: 2500,
  },
  {
    slug: "nda-guide-what-you-are-agreeing-to",
    title: "The Complete NDA Guide: What You're Actually Agreeing To",
    metaDescription: "NDAs are everywhere — job offers, client contracts, partnerships. Here's exactly what you're agreeing to when you sign one, and 5 red flags to negotiate away.",
    primaryKeyword: "what does an nda mean",
    secondaryKeywords: ["nda agreement explained", "non disclosure agreement plain english", "nda red flags"],
    category: "NDAs",
    angle: "Plain-English breakdown of NDAs for non-lawyers. What every section means, what's standard vs. unusual, and what to push back on. Written from the perspective of someone who just received an NDA and needs to decide whether to sign.",
    clauseLinks: {
      "NDA Clause": "/clauses/nda-clause",
      "Confidentiality Clause": "/clauses/confidentiality-clause",
      "Governing Law Clause": "/clauses/governing-law-clause",
      "Dispute Resolution Clause": "/clauses/dispute-resolution-clause",
      "Termination Clause": "/clauses/termination-clause",
      "Injunctive Relief Clause": "/clauses/injunctive-relief-clause",
      "Non-Disparagement Clause": "/clauses/non-disparagement-clause",
    },
    targetWordCount: 2000,
  },
  {
    slug: "ip-assignment-employment-what-you-give-up",
    title: "IP Assignment in Employment Contracts: What You're Actually Giving Up",
    metaDescription: "Most employees sign away all their IP without realising it. Here's exactly what IP assignment clauses claim, what the law actually allows, and how to protect your side projects.",
    primaryKeyword: "ip assignment clause employment",
    secondaryKeywords: ["intellectual property assignment employment", "who owns work i create for employer", "ip rights employment contract"],
    category: "Employment",
    angle: "Employee-facing guide that explains what IP assignment clauses actually claim, what states like California limit, and how to protect personal projects and pre-existing IP. Includes example language comparison: overreach vs. reasonable.",
    clauseLinks: {
      "IP Assignment Clause": "/clauses/ip-assignment-clause",
      "Work for Hire Clause": "/clauses/work-for-hire-clause",
      "Moral Rights Clause": "/clauses/moral-rights-clause",
      "Background IP Clause": "/clauses/background-ip-clause",
      "Patent Rights Clause": "/clauses/patent-rights-clause",
      "Copyright Assignment Clause": "/clauses/copyright-assignment-clause",
      "IP Assignment in California": "/clauses/ip-assignment-clause/california",
      "Moonlighting Clause": "/clauses/moonlighting-clause",
    },
    targetWordCount: 2200,
  },
  {
    slug: "force-majeure-clause-explained",
    title: "Force Majeure Clauses Explained: Does Your Contract Protect You From Disruptions?",
    metaDescription: "Force majeure lets parties off the hook when the unforeseeable happens. But COVID showed how contested these clauses are. Here's how to make yours actually work.",
    primaryKeyword: "force majeure clause explained",
    secondaryKeywords: ["force majeure covid contracts", "force majeure definition contract", "does force majeure cover pandemic"],
    category: "Contract Clauses",
    angle: "Post-COVID deep dive on force majeure. What it covers, what it doesn't, how COVID changed the landscape, and what a well-drafted force majeure clause looks like. Practical and timely.",
    clauseLinks: {
      "Force Majeure Clause": "/clauses/force-majeure-clause",
      "Material Adverse Change Clause": "/clauses/material-adverse-change-clause",
      "Termination Clause": "/clauses/termination-clause",
      "Governing Law Clause": "/clauses/governing-law-clause",
      "Liquidated Damages Clause": "/clauses/liquidated-damages-clause",
      "Best Efforts Clause": "/clauses/best-efforts-clause",
    },
    targetWordCount: 1800,
  },
  {
    slug: "saas-contract-clauses-guide",
    title: "SaaS Contract Clauses: The 8 Terms Every Software Buyer Must Understand",
    metaDescription: "Signing a SaaS contract? These 8 clauses determine what you own, what happens if the software goes down, and whether you can actually leave. A buyer's guide.",
    primaryKeyword: "saas contract clauses",
    secondaryKeywords: ["software subscription contract terms", "saas agreement important clauses", "what to check in saas contract"],
    category: "Business Contracts",
    angle: "Buyer-side guide for companies procuring SaaS software. What the vendor is trying to accomplish in each clause, what's negotiable, and what the risk is if you sign without pushing back.",
    clauseLinks: {
      "Service Level Agreement Clause": "/clauses/service-level-agreement-clause",
      "Limitation of Liability Clause": "/clauses/limitation-of-liability-clause",
      "Indemnification Clause": "/clauses/indemnification-clause",
      "Data Ownership Clause": "/clauses/data-ownership-clause",
      "Renewal Clause": "/clauses/renewal-clause",
      "IP Assignment Clause": "/clauses/ip-assignment-clause",
      "License Clause": "/clauses/license-clause",
      "Most-Favored-Nation Clause": "/clauses/most-favored-nation-clause",
      "Source Code Escrow Clause": "/clauses/source-code-escrow-clause",
    },
    targetWordCount: 2000,
  },
  {
    slug: "arbitration-vs-court-what-your-contract-means",
    title: "Arbitration vs. Court: What Your Contract's Dispute Clause Actually Means",
    metaDescription: "Most contracts force disputes into arbitration instead of court. Is that good or bad for you? Here's what arbitration clauses actually mean and when to push back.",
    primaryKeyword: "arbitration clause contract",
    secondaryKeywords: ["mandatory arbitration clause", "arbitration vs litigation contract", "what is arbitration clause"],
    category: "Contract Clauses",
    angle: "Balanced breakdown explaining what arbitration actually is, pros and cons for both sides, and when arbitration clauses are and aren't enforceable. Explains class action waivers and the controversy around them.",
    clauseLinks: {
      "Arbitration Clause": "/clauses/arbitration-clause",
      "Dispute Resolution Clause": "/clauses/dispute-resolution-clause",
      "Governing Law Clause": "/clauses/governing-law-clause",
      "Attorneys Fees Clause": "/clauses/attorneys-fees-clause",
      "Injunctive Relief Clause": "/clauses/injunctive-relief-clause",
      "Arbitration in California": "/clauses/arbitration-clause/california",
      "Arbitration in New York": "/clauses/arbitration-clause/new-york",
    },
    targetWordCount: 2000,
  },
];

const SYSTEM_PROMPT = `You are a senior legal content writer for Contrivox, an AI contract analysis platform. You write clear, practical, genuinely helpful blog articles about contract law for non-lawyers. Your writing is:
- Accessible but not dumbed down
- Concrete and example-driven
- Honest about complexity
- SEO-optimised without keyword stuffing
- Never fabricates legal citations or case names`;

function buildPrompt(article: ArticleSpec): string {
  const clauseLinksList = Object.entries(article.clauseLinks)
    .map(([name, url]) => `- [${name}](${url})`)
    .join("\n");

  return `Write a comprehensive blog article for Contrivox's blog with the following specification:

Title: ${article.title}
Primary keyword: ${article.primaryKeyword}
Secondary keywords: ${article.secondaryKeywords.join(", ")}
Target word count: ${article.targetWordCount} words
Writing angle: ${article.angle}

Clause pages to link to (use these exact markdown links naturally within the article body):
${clauseLinksList}

The article MUST:
1. Open with a strong hook paragraph (no fluff)
2. Use H2 (##) and H3 (###) headers for structure
3. Include at least one practical comparison or example per major section
4. Naturally incorporate at least 8 of the clause page links above
5. Include a "Quick Reference" table near the end
6. End with an FAQ section (5-7 questions) in H3 format
7. End with a brief CTA paragraph mentioning Contrivox's AI contract analysis tool (link to /)
8. Include a disclaimer: "Contrivox provides AI-powered contract explanations, not legal advice."

Format the output as a complete markdown file ready to save, starting with the frontmatter block:

---
title: "${article.title}"
slug: "${article.slug}"
metaDescription: "${article.metaDescription}"
primaryKeyword: "${article.primaryKeyword}"
secondaryKeywords:
${article.secondaryKeywords.map((k) => `  - ${k}`).join("\n")}
searchIntent: "Informational"
suggestedSchema: "Article + FAQPage + BreadcrumbList"
suggestedCategory: "${article.category}"
suggestedFeaturedImage: "A professional reviewing a contract document"
relatedArticles: []
publishedAt: "${new Date().toISOString().split("T")[0]}"
updatedAt: "${new Date().toISOString().split("T")[0]}"
featured: false
author: "Contrivox Legal Team"
ctaPlacements:
  - mid
  - end
---

Then write the full article body. Return ONLY the complete markdown (frontmatter + body), no commentary.`;
}

async function generateArticle(article: ArticleSpec): Promise<string> {
  const message = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 4096,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: "user", content: buildPrompt(article) }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const filter = args.filter((a) => !a.startsWith("--"))[0];

  const targets = filter
    ? ARTICLES.filter((a) => a.slug.includes(filter) || a.primaryKeyword.includes(filter))
    : ARTICLES;

  if (targets.length === 0) {
    console.log(`No articles matched filter: ${filter}`);
    process.exit(1);
  }

  const outputDir = join(process.cwd(), "content", "blog");
  mkdirSync(outputDir, { recursive: true });

  console.log(`Generating ${targets.length} blog article(s)...\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const article = targets[i];
    const filePath = join(outputDir, `${article.slug}.md`);

    if (existsSync(filePath) && !force) {
      console.log(`  [${i + 1}/${targets.length}] ${article.slug} — skipped (already exists, use --force to overwrite)`);
      skipped++;
      continue;
    }

    process.stdout.write(`  [${i + 1}/${targets.length}] ${article.slug}... `);

    try {
      const markdown = await generateArticle(article);
      writeFileSync(filePath, markdown, "utf8");
      console.log(`✓ (${markdown.split(/\s+/).length} words)`);
      success++;
    } catch (err) {
      console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }

    if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n${success} generated, ${skipped} skipped, ${failed} failed.`);
  if (success > 0) console.log("Articles saved to content/blog/ — commit and push to publish.");
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
