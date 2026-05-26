#!/usr/bin/env tsx
/**
 * Seed the clauses table with 20 starter clauses.
 * Idempotent — uses upsert on slug.
 *
 * Usage:
 *   tsx --env-file=.env.local scripts/seed-clauses.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { ClauseSeed } from "../lib/seo-types";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY\n" +
      "Run with: tsx --env-file=.env.local scripts/seed-clauses.ts"
    );
  }
  return createClient(url, key);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data — 20 starter clauses with real legal definitions and risks
// ─────────────────────────────────────────────────────────────────────────────

const CLAUSES: ClauseSeed[] = [
  {
    slug: "non-compete-clause",
    name: "Non-Compete Clause",
    also_known_as: [
      "non-competition clause",
      "competitor restriction clause",
      "restrictive covenant",
      "covenant not to compete",
    ],
    category: "employment",
    search_volume_tier: "high",
    definition_seed:
      "A non-compete clause prohibits an employee or contractor from working for a competitor or starting a competing business for a specified period and geographic area after leaving the company. Enforceability varies dramatically by US state — California, North Dakota, Minnesota, and Oklahoma effectively ban most non-competes, while states like Florida actively enforce them.",
    key_risks: [
      "Geographic and time scope may be unreasonably broad — covering entire industries nationwide for 2-3 years",
      "Vague 'competitor' definitions could technically bar you from working anywhere in your field",
      "May apply even if you are laid off, not just when you voluntarily resign",
      "FTC's 2024 rule banning most non-competes was vacated by federal courts — enforceability is currently state-by-state",
      "Employers sometimes litigate non-competes aggressively even when enforceability is doubtful, using legal costs as leverage",
    ],
    related_clause_slugs: [
      "non-solicitation-clause",
      "garden-leave-clause",
      "confidentiality-clause",
      "ip-assignment-clause",
    ],
    jurisdictions: ["us-general", "us-california", "uk", "eu"],
  },
  {
    slug: "non-disclosure-agreement",
    name: "Non-Disclosure Agreement (NDA)",
    also_known_as: [
      "NDA",
      "confidentiality agreement",
      "secrecy agreement",
      "CDA",
      "non-disclosure contract",
    ],
    category: "general",
    search_volume_tier: "high",
    definition_seed:
      "A non-disclosure agreement is a legally binding contract preventing one or both parties from disclosing specified confidential information to third parties. NDAs are used in employment, business partnerships, M&A due diligence, and investor discussions to protect trade secrets and proprietary information.",
    key_risks: [
      "Overly broad definitions of 'confidential information' that may encompass publicly available data or your own pre-existing knowledge",
      "Perpetual duration clauses create indefinite restrictions with no time limit",
      "One-sided NDAs that heavily favor the more powerful party in practice",
      "Restrictions may prevent you from discussing your professional skills and experience in future job searches",
      "Improper NDA use to silence harassment or discrimination victims — many US states now ban non-disparagement and confidentiality clauses in settlement agreements for these claims",
    ],
    related_clause_slugs: [
      "confidentiality-clause",
      "non-compete-clause",
      "entire-agreement-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "arbitration-clause",
    name: "Arbitration Clause",
    also_known_as: [
      "mandatory arbitration clause",
      "binding arbitration clause",
      "dispute resolution clause",
      "FAA arbitration provision",
      "forced arbitration clause",
    ],
    category: "general",
    search_volume_tier: "high",
    definition_seed:
      "An arbitration clause requires disputes between the parties to be resolved through private arbitration rather than in a public court. The arbitrator's decision is typically final and binding with very limited grounds for appeal, governed by the Federal Arbitration Act (FAA) in the US.",
    key_risks: [
      "Waives your constitutional right to a jury trial and public court proceedings",
      "Class action waivers eliminate your ability to join others with similar claims, drastically reducing leverage against large companies",
      "Discovery is severely limited compared to court — harder to uncover evidence of wrongdoing",
      "Arbitrators employed by repeat-user arbitration firms may have an institutional bias toward the companies that hire them regularly",
      "JAMS and AAA arbitration filing fees can run into thousands of dollars, though some states require employers to bear these costs",
    ],
    related_clause_slugs: [
      "governing-law-clause",
      "entire-agreement-clause",
      "liquidated-damages-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "ip-assignment-clause",
    name: "IP Assignment Clause",
    also_known_as: [
      "intellectual property assignment",
      "invention assignment clause",
      "work product assignment",
      "proprietary information agreement",
      "PIIA",
    ],
    category: "ip",
    search_volume_tier: "medium",
    definition_seed:
      "An IP assignment clause transfers ownership of any intellectual property you create during employment or engagement — including inventions, software, designs, and creative works — to the employer or client. California Labor Code § 2870 and similar laws in Delaware, Illinois, Minnesota, North Carolina, and Washington carve out inventions made on your own time without company resources.",
    key_risks: [
      "Overly broad language ('any and all inventions') may capture personal side projects created entirely off the clock",
      "Temporal overreach — some clauses assign IP created before your employment start date, which may be unenforceable",
      "Missing carve-out for inventions unrelated to the company's current or reasonably anticipated business",
      "State law protections (CA Labor Code § 2870, IL 765 ILCS 1060/2) require you to affirmatively document qualifying personal projects to preserve rights",
      "Moral rights waivers may eliminate attribution rights available under copyright law",
    ],
    related_clause_slugs: [
      "work-for-hire-clause",
      "confidentiality-clause",
      "non-compete-clause",
    ],
    jurisdictions: ["us-general", "us-california", "uk", "eu"],
  },
  {
    slug: "automatic-renewal-clause",
    name: "Automatic Renewal Clause",
    also_known_as: [
      "evergreen clause",
      "auto-renewal clause",
      "rollover clause",
      "self-renewing contract provision",
    ],
    category: "commercial",
    search_volume_tier: "medium",
    definition_seed:
      "An automatic renewal clause causes a contract to renew for another full term — often one year — unless one party provides written cancellation notice within a narrow window before the renewal date. Missing the window legally binds you to another full term with all associated fees and obligations.",
    key_risks: [
      "Notice windows as short as 30-60 days create genuine risk of accidental renewal, especially when managing multiple vendor contracts",
      "Renewal on the same or materially worse terms — price escalation clauses often operate alongside auto-renewal",
      "Substantial early termination fees apply if you try to exit after missing the cancellation window",
      "California, New York, and Illinois require prominent disclosure of auto-renewal terms in consumer contracts — B2B contracts have fewer protections",
      "Auto-renewal combined with price increase provisions can lock you into higher costs with no renegotiation opportunity",
    ],
    related_clause_slugs: [
      "payment-terms-clause",
      "entire-agreement-clause",
      "governing-law-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "indemnification-clause",
    name: "Indemnification Clause",
    also_known_as: [
      "hold harmless clause",
      "indemnity clause",
      "save harmless clause",
      "indemnification provision",
    ],
    category: "commercial",
    search_volume_tier: "medium",
    definition_seed:
      "An indemnification clause requires one party (the indemnitor) to compensate the other (the indemnitee) for specified losses, damages, claims, and legal costs arising from defined events. The scope of triggering events and the absence of a liability cap determine whether the clause creates manageable or catastrophic financial exposure.",
    key_risks: [
      "One-sided indemnification that only protects one party while exposing the other to unlimited liability",
      "Indemnifying the other party for their own negligence — courts in many states disfavor this but it remains common in commercial contracts",
      "No cap on indemnification exposure, creating liability that can far exceed the contract's value",
      "Defense cost provisions requiring you to fund the other party's legal defense before any determination of fault",
      "Broad third-party claim triggers may expose you to liability for events entirely outside your control",
    ],
    related_clause_slugs: [
      "limitation-of-liability",
      "governing-law-clause",
      "force-majeure-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "limitation-of-liability",
    name: "Limitation of Liability Clause",
    also_known_as: [
      "liability cap clause",
      "limitation of damages clause",
      "consequential damages exclusion",
      "LoL clause",
    ],
    category: "commercial",
    search_volume_tier: "medium",
    definition_seed:
      "A limitation of liability clause caps the maximum damages one party can recover from the other — typically to a multiple of fees paid or a fixed dollar amount — and usually excludes consequential, indirect, and punitive damages entirely. These clauses can dramatically limit recovery even when a breach causes significant real-world harm.",
    key_risks: [
      "Liability caps set at only 1x the monthly or annual fee — far below potential data breach or business interruption exposure",
      "Exclusion of consequential damages eliminates recovery for lost profits and business disruption even when these were foreseeable at signing",
      "Asymmetric caps that protect the vendor substantially more than the customer",
      "Carve-outs for willful misconduct and fraud may not extend to grossly negligent conduct, creating a gap in protection",
      "Courts are generally reluctant to override clearly negotiated limitation clauses between sophisticated commercial parties",
    ],
    related_clause_slugs: [
      "indemnification-clause",
      "governing-law-clause",
      "entire-agreement-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "at-will-employment",
    name: "At-Will Employment Clause",
    also_known_as: [
      "employment at will",
      "at-will termination",
      "at-will doctrine",
      "at-will provision",
    ],
    category: "employment",
    search_volume_tier: "high",
    definition_seed:
      "At-will employment means either the employer or employee may end the employment relationship at any time, for any lawful reason or no reason, without advance notice or cause. The US is the only developed country where at-will employment is the default rule — applicable in 49 states, with Montana requiring cause after a completed probationary period.",
    key_risks: [
      "Employer can terminate without giving any reason, providing any severance, or giving advance notice unless these are separately agreed in writing",
      "Implied contract exceptions from employee handbooks or verbal promises are recognized in most states but notoriously difficult to enforce",
      "Wrongful termination claims for discrimination or retaliation are legally valid but expensive and statistically uncertain to win",
      "Performance improvement plans are typically optional under at-will — employers have no obligation to provide them before termination",
      "At-will clauses often coexist with binding arbitration and non-compete provisions that survive termination and still bind you",
    ],
    related_clause_slugs: [
      "probationary-period-clause",
      "non-compete-clause",
      "severability-clause",
    ],
    jurisdictions: ["us-general"],
  },
  {
    slug: "garden-leave-clause",
    name: "Garden Leave Clause",
    also_known_as: [
      "gardening leave",
      "garden leave provision",
      "paid garden leave",
      "paid notice period",
    ],
    category: "employment",
    search_volume_tier: "low",
    definition_seed:
      "A garden leave clause permits an employer to require a departing employee to stay away from the workplace during their notice period — receiving full pay and benefits — to prevent access to clients, colleagues, and sensitive information before joining a competitor. The term originates in the UK and is most common in financial services and professional services firms.",
    key_risks: [
      "Functionally extends the effective restriction period when combined with post-employment non-compete obligations",
      "You remain legally employed with all obligations intact — including non-solicitation and confidentiality — while being prevented from working elsewhere",
      "UK courts treat excessively long garden leave as a restraint of trade and may refuse injunctive relief to enforce unreasonably lengthy periods",
      "Combined garden leave plus post-employment non-compete can create total restriction windows of 12-24 months",
      "Employer is not obligated to assign meaningful work but can prevent you from taking any other employment",
    ],
    related_clause_slugs: [
      "non-compete-clause",
      "non-solicitation-clause",
      "confidentiality-clause",
    ],
    jurisdictions: ["uk", "us-general"],
  },
  {
    slug: "probationary-period-clause",
    name: "Probationary Period Clause",
    also_known_as: [
      "probation period",
      "trial period",
      "introductory period",
      "evaluation period",
    ],
    category: "employment",
    search_volume_tier: "low",
    definition_seed:
      "A probationary period clause establishes an initial employment period — typically 30-90 days — during which either party may terminate with reduced or no notice requirements. Employers use probation to evaluate performance and fit; employees use it to assess the role and culture. The legal significance of probation varies considerably by jurisdiction.",
    key_risks: [
      "Employer can dismiss during probation with minimal notice and without providing reasons in at-will US states",
      "UK statutory rights (unfair dismissal protection) do not accrue until 2 years of employment — probation period is rarely the operative threshold there",
      "Probation may be extended unilaterally by the employer without clear criteria, performance benchmarks, or your consent",
      "Benefits accrual, pension contributions, and equity vesting schedules often do not begin until after probation ends",
      "IP assignment and non-compete provisions typically take effect from day one regardless of probation outcome",
    ],
    related_clause_slugs: [
      "at-will-employment",
      "non-compete-clause",
      "ip-assignment-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "confidentiality-clause",
    name: "Confidentiality Clause",
    also_known_as: [
      "confidentiality provision",
      "secrecy clause",
      "non-disclosure provision",
      "confidentiality obligation",
    ],
    category: "general",
    search_volume_tier: "high",
    definition_seed:
      "A confidentiality clause embedded within a broader contract — employment agreement, service agreement, partnership agreement — prohibits a party from disclosing specified confidential information to unauthorized third parties. Unlike a standalone NDA, it operates as one provision among many and typically survives termination of the main agreement.",
    key_risks: [
      "Vague definition of 'confidential' with no carve-out for publicly available information or independently developed knowledge",
      "Indefinite survival clauses create confidentiality obligations that outlast the relationship permanently",
      "Conflict with whistleblower obligations — overly broad clauses may chill legally protected reports to the SEC, NLRB, or OSHA",
      "Missing reverse engineering and parallel development exceptions can expose you to claims for independently developed work",
      "Breach remedies typically include injunctive relief, allowing courts to order you to stop work while litigation proceeds",
    ],
    related_clause_slugs: [
      "non-disclosure-agreement",
      "non-compete-clause",
      "entire-agreement-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "payment-terms-clause",
    name: "Payment Terms Clause",
    also_known_as: [
      "payment schedule",
      "net payment terms",
      "invoice payment terms",
      "accounts payable terms",
    ],
    category: "commercial",
    search_volume_tier: "medium",
    definition_seed:
      "A payment terms clause specifies when invoices must be paid, the applicable late payment interest rate, and the consequences of non-payment. Net-30, Net-60, and Net-90 terms mean payment is due 30, 60, or 90 days after invoice date — terms that can create severe cash flow problems for small vendors and independent contractors.",
    key_risks: [
      "Extended Net-60 or Net-90 terms effectively provide the client with interest-free working capital at the vendor's expense",
      "Right of offset clauses allow the client to deduct disputed amounts from otherwise valid, undisputed invoices",
      "Acceptance-conditioned payment clocks — the payment timer does not start until formal acceptance is granted, which clients may delay indefinitely",
      "Late payment interest rates set at or below prevailing market rates provide no real financial incentive for timely payment",
      "No provisional payment mechanism for disputed invoices forces vendors to chase full payment even when only a minor line item is contested",
    ],
    related_clause_slugs: [
      "automatic-renewal-clause",
      "liquidated-damages-clause",
      "kill-fee-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "kill-fee-clause",
    name: "Kill Fee Clause",
    also_known_as: [
      "cancellation fee",
      "project cancellation fee",
      "termination fee",
      "abandonment fee",
    ],
    category: "freelance",
    search_volume_tier: "low",
    definition_seed:
      "A kill fee is a specified payment owed to a contractor, writer, or creative professional when a client cancels a project after work has begun. It compensates for time already invested and the opportunity cost of declining other work during the project period.",
    key_risks: [
      "Kill fee percentages of 10-25% of total project value are frequently insufficient to cover sunk costs and foregone opportunities",
      "Ambiguous cancellation triggers — the contract may not define what constitutes 'cancellation' versus a 'pause', 'scope change', or 'delay'",
      "Expenses already incurred (travel, subcontractors, materials, licensing) may not be reimbursable under the kill fee provision",
      "Milestone-based kill fees only protect completed stages — early-stage work before the first milestone may trigger no payment at all",
      "Client may dispute whether a true cancellation occurred, delaying payment indefinitely while you pursue other work",
    ],
    related_clause_slugs: [
      "payment-terms-clause",
      "force-majeure-clause",
      "work-for-hire-clause",
    ],
    jurisdictions: ["us-general", "uk"],
  },
  {
    slug: "work-for-hire-clause",
    name: "Work-for-Hire Clause",
    also_known_as: [
      "work made for hire",
      "work for hire agreement",
      "WFH provision",
      "commissioned work clause",
    ],
    category: "ip",
    search_volume_tier: "medium",
    definition_seed:
      "A work-for-hire clause designates creative or intellectual work produced under a contract as legally authored by the hiring party, not the actual creator. Under US copyright law (17 U.S.C. § 101), works-for-hire arise in two scenarios: works by employees within the scope of employment, and nine specifically enumerated categories of specially commissioned works.",
    key_risks: [
      "Independent contractors cannot legally create works-for-hire outside the nine statutory categories — the clause may be unenforceable without a separate copyright assignment provision",
      "Creator permanently loses all copyright ownership, including the right to display work in a portfolio without explicit permission",
      "No attribution rights — the client can publish and distribute the work without crediting the actual creator",
      "US Copyright Act § 203 termination right (reclaiming rights after 35 years) does not apply to genuine works-for-hire, only to assignments",
      "EU and UK moral rights — right to attribution and integrity — may provide some creator protections not available under US work-for-hire doctrine",
    ],
    related_clause_slugs: [
      "ip-assignment-clause",
      "confidentiality-clause",
      "kill-fee-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "force-majeure-clause",
    name: "Force Majeure Clause",
    also_known_as: [
      "act of god clause",
      "unforeseeable circumstances clause",
      "FM clause",
      "superior force clause",
    ],
    category: "commercial",
    search_volume_tier: "medium",
    definition_seed:
      "A force majeure clause excuses a party's failure to perform contractual obligations when extraordinary events beyond their control — natural disasters, wars, pandemics, government orders — make performance impossible or commercially impracticable. Without this clause, strict common law rules hold parties fully liable for non-performance regardless of circumstances.",
    key_risks: [
      "Narrowly drafted qualifying events that exclude modern disruptions: cyberattacks, supply chain failures, pandemics, or government-imposed sanctions",
      "Strict and short notice requirements — failure to notify the other party promptly after the triggering event typically waives force majeure protection entirely",
      "Temporary excuse only: extended force majeure events often trigger mutual termination rights, sometimes without compensation for work performed",
      "Commercial impracticability (increased cost or difficulty) rarely qualifies — courts require near-impossibility, not mere hardship",
      "Absence of a force majeure clause leaves you subject to common law frustration doctrine, which US courts apply extremely narrowly",
    ],
    related_clause_slugs: [
      "governing-law-clause",
      "indemnification-clause",
      "limitation-of-liability",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "governing-law-clause",
    name: "Governing Law Clause",
    also_known_as: [
      "choice of law clause",
      "applicable law clause",
      "choice of jurisdiction",
      "jurisdiction clause",
      "forum selection clause",
    ],
    category: "general",
    search_volume_tier: "medium",
    definition_seed:
      "A governing law clause specifies which jurisdiction's laws govern interpretation and enforcement of the contract, and typically designates a forum (court or arbitration body) for resolving disputes. The chosen law can fundamentally alter your rights — a non-compete void in California may be fully enforceable under Texas law governing the same contract.",
    key_risks: [
      "Chosen jurisdiction's employment, consumer, or contract laws may be dramatically less protective than your home state's laws",
      "Distant mandatory forum clauses (requiring litigation in Delaware or New York) make enforcement prohibitively expensive for individuals",
      "Non-compete enforceability, notice periods, and wage payment protections vary significantly by state — the governing law determines these outcomes",
      "Choice of foreign law clauses in consumer or employment contracts may be unenforceable under the employee's or consumer's local mandatory law",
      "Statute of limitations periods vary by jurisdiction — some states grant significantly less time to bring breach of contract claims",
    ],
    related_clause_slugs: [
      "arbitration-clause",
      "severability-clause",
      "entire-agreement-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "severability-clause",
    name: "Severability Clause",
    also_known_as: [
      "savings clause",
      "severability provision",
      "partial invalidity clause",
      "blue pencil clause",
    ],
    category: "general",
    search_volume_tier: "low",
    definition_seed:
      "A severability clause provides that if any provision of the contract is found unenforceable or invalid, the remaining provisions continue in full force. Without it, a court finding one clause invalid might void the entire agreement — with it, courts may surgically remove or rewrite the offending provision.",
    key_risks: [
      "Blue-penciling: courts in some jurisdictions can narrow (not void) an overly broad non-compete clause, creating a more targeted but still enforceable restriction",
      "You cannot use an unenforceable clause as leverage to renegotiate the whole agreement — the rest survives intact",
      "The provision a court severs may be the primary protection you negotiated — for example, a liability cap or termination-for-cause requirement",
      "Courts' willingness to blue-pencil versus void entirely varies significantly by jurisdiction and clause type",
      "Severability generally benefits the stronger drafting party by preserving most of the agreement even when individual provisions fail",
    ],
    related_clause_slugs: [
      "governing-law-clause",
      "entire-agreement-clause",
      "arbitration-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "entire-agreement-clause",
    name: "Entire Agreement Clause",
    also_known_as: [
      "integration clause",
      "merger clause",
      "whole agreement clause",
      "parol evidence clause",
    ],
    category: "general",
    search_volume_tier: "low",
    definition_seed:
      "An entire agreement clause states that the written contract is the complete and final agreement between the parties, superseding all prior negotiations, representations, oral promises, and earlier written documents. Once signed, verbal commitments made during negotiation are legally unenforceable — only what is in the written contract counts.",
    key_risks: [
      "Verbal promises made during negotiation — salary reviews, promotion timelines, remote work arrangements — become legally unenforceable once you sign",
      "Prior written representations, term sheets, and letter of intent terms are no longer binding",
      "Cannot rely on statements in job postings, recruiter emails, or the initial offer letter if a subsequent employment agreement contains this clause",
      "Fraudulent inducement claims can theoretically survive an integration clause but require proving intentional misrepresentation, which is difficult and expensive",
      "Any agreed modifications should be in writing — oral amendments to a contract containing this clause may be legally ineffective",
    ],
    related_clause_slugs: [
      "confidentiality-clause",
      "governing-law-clause",
      "severability-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
  {
    slug: "non-solicitation-clause",
    name: "Non-Solicitation Clause",
    also_known_as: [
      "non-solicit clause",
      "no-poach clause",
      "anti-solicitation clause",
      "customer non-solicit",
    ],
    category: "employment",
    search_volume_tier: "medium",
    definition_seed:
      "A non-solicitation clause prohibits a departing employee from actively recruiting former colleagues or soliciting former clients for a specified period after leaving the company. Unlike a non-compete, it typically does not prevent you from working for a competitor — only from taking customers or employees with you.",
    key_risks: [
      "Broad definitions of 'solicitation' may capture passive actions — simply responding to a former client who contacts you first has been found to violate some clauses",
      "Separate employee and customer non-solicitation provisions can run independently with different durations and scope",
      "Courts uphold non-solicitation clauses more consistently than non-competes, even in California for customer solicitation in some circumstances",
      "May apply to clients you personally originated and brought to the company before taking this job",
      "If a former colleague joins your new firm, you may face claims of indirect solicitation even if you did not actively recruit them",
    ],
    related_clause_slugs: [
      "non-compete-clause",
      "garden-leave-clause",
      "confidentiality-clause",
    ],
    jurisdictions: ["us-general", "us-california", "uk", "eu"],
  },
  {
    slug: "liquidated-damages-clause",
    name: "Liquidated Damages Clause",
    also_known_as: [
      "pre-agreed damages",
      "stipulated damages clause",
      "LD clause",
      "agreed damages provision",
    ],
    category: "commercial",
    search_volume_tier: "low",
    definition_seed:
      "A liquidated damages clause pre-specifies the damages payable if a particular breach occurs, avoiding the need to prove actual loss in court. US courts enforce liquidated damages when the pre-specified amount represented a genuine estimate of likely harm at the time of contracting. UK and Commonwealth courts apply a stricter 'penalty rule' and will strike down disproportionate amounts.",
    key_risks: [
      "Pre-specified amounts are sometimes set disproportionately high relative to the harm your breach would actually cause",
      "UK and Commonwealth courts will void a clause as an unenforceable penalty if the amount is out of all proportion to legitimate interests — US courts are significantly more permissive",
      "One-sided application — clauses that trigger liquidated damages only for your breach while leaving the other party's breaches subject to uncertain actual damages assessment",
      "Liquidated damages may cap your own recovery if the other party breaches — you cannot exceed the specified amount even if actual losses are far higher",
      "Courts assess whether the amount was a genuine pre-estimate at the time of contracting, not at the time of breach — original context matters",
    ],
    related_clause_slugs: [
      "indemnification-clause",
      "payment-terms-clause",
      "governing-law-clause",
    ],
    jurisdictions: ["us-general", "uk", "eu"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed runner
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const db = getDb();

  console.log(`Seeding ${CLAUSES.length} clauses…\n`);

  const { error } = await db
    .from("clauses")
    .upsert(CLAUSES, { onConflict: "slug", ignoreDuplicates: false });

  if (error) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ ${CLAUSES.length} clauses upserted successfully.`);
  console.log("\nSlugs seeded:");
  CLAUSES.forEach((c) => console.log(`  • ${c.slug}`));
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
