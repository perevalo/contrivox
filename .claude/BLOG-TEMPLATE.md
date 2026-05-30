# Contrivox Blog Article Template
# Consult this file every time a new blog article is requested.
# Last updated: 2026-05-30 (v2)

---

## Voice & tone (non-negotiable)

- Plain English. Written for the person holding a contract, not for lawyers.
- Answer-first. No fluff intro. The first sentence after the title delivers value.
- Direct and slightly urgent — this matters, read it before you sign.
- Never condescending. Assume the reader is smart but unfamiliar with legalese.
- Concrete over abstract. Real examples beat definitions every time.
- No em-dash overuse. Prefer short sentences over long compound ones.

---

## Frontmatter (copy this block exactly, fill every field)

```yaml
---
title: "Full Article Title — Matches H1 Exactly"
slug: "url-slug-no-trailing-slash"
metaDescription: "150–160 characters. Targets primary keyword. Written as a benefit statement, not a description."
primaryKeyword: "exact phrase to rank for"
secondaryKeywords:
  - secondary phrase one
  - secondary phrase two
  - secondary phrase three
  - secondary phrase four
searchIntent: "Informational / High intent"   # or: Informational | Informational / Pre-transactional | Informational / Navigational | Informational / Transactional
suggestedSchema: "Article + FAQ + BreadcrumbList"
suggestedCategory: "NDAs"   # must match exactly — see valid values below
suggestedFeaturedImage: "One sentence describing the ideal image"
relatedArticles:
  - slug-one
  - slug-two
  - slug-three
publishedAt: "2026-05-29"
updatedAt: "2026-05-29"
featured: false             # only set true if explicitly requested
author: "Contrivox Editorial Team"
ctaPlacements:
  - After introduction
  - After [key section name]
  - Conclusion
---
```

### Valid suggestedCategory values (case-sensitive, must match exactly)

| Value | Color |
|---|---|
| `Rental Contracts` | red |
| `Employment` | amber |
| `NDAs` | purple |
| `Contract Clauses` | cyan |
| `Business Contracts` | green |
| `Freelance` | orange |
| `AI & Technology` | indigo |

---

## Article structure (follow this order every time)

```markdown
# Article Title — Identical to frontmatter title

**Quick summary:** 1–3 sentence executive summary. Answers the main question immediately.
Readers who only read this should walk away knowing the key takeaway.

---

[Opening paragraph — hook. No heading. 2–4 sentences. Sets up the problem/situation
the reader is in. Do NOT start with "In today's world" or similar filler.]

> **[Contextual CTA — first placement]** [Upload it to Contrivox](/#upload-sec)
> for a plain-English breakdown in under a minute.

---

## [Main Section 1]

[Body. H3 subheadings for sub-topics. Tables where comparing options.
Bold for key terms on first use. Concrete examples inline.]

### [Subsection if needed]

[Content]

---

## [Main Section 2]

[Same pattern]

---

## [Main Section 3 — often a red flags / what to watch for section]

| Red Flag | Why It Matters |
|---|---|
| Specific bad thing | Specific consequence |
| Another bad thing | Its consequence |

> **[Second CTA — mid-article]** [Upload your contract to Contrivox](/#upload-sec)
> for an instant plain-English analysis — flagged, explained, and scored.

---

## FAQ: [Topic Name]

**[Question 1 — most-searched PAA question]**
[Answer. 2–4 sentences. Direct. No hedging beyond the disclaimer at the end.]

**[Question 2]**
[Answer.]

**[Question 3]**
[Answer.]

**[Question 4]**
[Answer.]

**[Question 5]**
[Answer.]

---

## Related guides

- [Article Title One](/blog/slug-one)
- [Article Title Two](/blog/slug-two)
- [Article Title Three if applicable](/blog/slug-three)

---

## [Conclusion heading — short, punchy, e.g. "Read It Before You Sign It"]

[2–3 sentence close. Reinforces the key takeaway. Leads into CTA.]

**[Upload your [document type] to Contrivox](/#upload-sec) →** [One sentence CTA copy
relevant to the article topic — plain-English analysis, flagged, scored, in under a minute.]

*Contrivox provides AI-powered contract explanations, not legal advice.
For [high-stakes situations relevant to the topic], consult a licensed attorney.*
```

---

## Word count targets by article type

| Type | Target | Notes |
|---|---|---|
| Definitional ("What is X") | 900–1,100 | Cover the concept thoroughly, don't pad |
| How-to / checklist | 1,000–1,300 | Numbered or H3 structure preferred |
| Comparison ("X vs Y") | 800–1,000 | Table required, conclusion required |
| Negotiation / action guide | 1,100–1,400 | Include script or example language |
| State-specific legal | 1,000–1,200 | Must note law can change, link state guides |
| Red flags / warning signs | 900–1,100 | Table of red flags required |

---

## Internal linking rules

- Link to other blog articles using `/blog/slug` format
- Link to clause pages using `/clauses/clause-name` format (if they exist)
- Minimum 2 internal links in every article body (not counting Related guides)
- Related guides section always goes at the very bottom, before the conclusion heading
- Never link the same URL twice in the body

### Blog articles available to link to (52 as of 2026-05-30)

| Title | Slug |
|---|---|
| What Is an NDA? Everything You Should Check Before Signing One | `what-is-an-nda` |
| What to Look for in an NDA Before You Sign | `what-to-look-for-in-nda` |
| Signing an NDA — What It Actually Means for You | `signing-an-nda` |
| NDA vs Confidentiality Agreement — What's the Difference? | `nda-vs-confidentiality-agreement` |
| Non-Compete Clauses: What Employees Actually Need to Know | `non-compete-clause-explained` |
| How to Negotiate a Non-Compete Agreement (Without a Lawyer) | `how-to-negotiate-non-compete` |
| Is a Non-Compete Enforceable in California? (2025) | `non-compete-enforceable-california` |
| Is a Non-Compete Enforceable in New York? (2025) | `non-compete-enforceable-new-york` |
| Is a Non-Compete Enforceable in Texas? (2025) | `non-compete-enforceable-texas` |
| What Happens If You Violate a Non-Compete Agreement? (2025) | `violate-non-compete-agreement` |
| Indemnification Clauses Explained Simply | `indemnification-clause-explained` |
| Termination Clauses Explained in Plain English | `termination-clause-explained` |
| How to Review a Rental Contract Before Signing | `how-to-review-rental-contract` |
| 10 Employment Contract Red Flags You Should Never Ignore | `employment-contract-red-flags` |
| How to Understand a Service Agreement Without Legal Knowledge | `service-agreement-review` |
| Freelance Contract Checklist: Everything Beginners Need to Include | `freelance-contract-checklist` |
| The Most Common Contract Clauses Explained in Plain English | `contract-clauses-explained` |
| Can AI Help You Understand Legal Contracts? (Yes — Here's How) | `ai-contract-analysis` |
| Arbitration Clause: What It Really Means and Can You Opt Out? | `arbitration-clause-opt-out` |
| IP Assignment Clauses: Does Your Employer Own Your Side Projects? | `ip-assignment-clause-side-projects` |
| The FTC Non-Compete Ban: What It Was and What Applies Now | `ftc-non-compete-ban` |
| What Is an NDA Form? The Document Explained in Plain English | `what-is-an-nda-form` |
| Is a Non-Compete Agreement Enforceable? A Plain-English State Guide | `is-a-non-compete-enforceable` |
| What Is an NDA Used For? 7 Real-World Situations Explained | `what-is-an-nda-used-for` |
| What a Non-Compete Agreement Contains — Annotated in Plain English | `non-compete-agreement-template` |
| NDA in Business: When Companies Use Them and What They Need to Cover | `nda-in-business` |
| NDA in a Relationship: What a Personal Confidentiality Agreement Actually Means | `nda-in-a-relationship` |
| Termination Clause Examples: 5 Real Clauses Annotated in Plain English | `termination-clause-examples` |
| Is a Non-Compete Enforceable in Florida? (2025) | `non-compete-enforceable-florida` |
| Immediate Termination Clause: What It Means and When It Can Be Used | `immediate-termination-clause` |
| How to Negotiate Your Contract: A Plain-English Guide to Pushing Back | `negotiating-your-contract` |
| Lease Agreement Clauses Explained: What Every Tenant Should Know | `lease-agreement-clauses-explained` |
| How to Get Out of a Non-Compete Agreement: Your Actual Options | `how-to-get-out-of-a-non-compete` |
| Non-Compete Agreements and Independent Contractors: What You Need to Know | `non-compete-independent-contractor` |
| Does a Non-Compete Apply If You Were Fired? What Your State Says | `non-compete-fired` |
| Freelance Contract Red Flags: 9 Warning Signs Before You Start Work | `freelance-contract-red-flags` |
| Severance Clause: What It Means and What to Check Before Signing | `severance-clause-explained` |
| Is a Non-Compete Enforceable in Illinois? (2025) | `non-compete-enforceable-illinois` |
| Arbitration Clause: What It Means, How It Works, and What You Give Up | `arbitration-clause-explained` |
| IP Assignment Clause Explained: Who Owns What You Create at Work | `ip-assignment-clause-explained` |
| Force Majeure Clause Explained: What Counts and What Doesn't | `force-majeure-clause-explained` |
| Governing Law Clause Explained: Why the Chosen State Changes Everything | `governing-law-clause-explained` |
| NDA Clause — Definition, Risks & Red Flags | `nda-clause` (clauses page) |
| Anticompetition Clause — Definition, Risks & Red Flags | `anticompetition-clause` (clauses page) |
| Early Termination Clause — Definition, Risks & Red Flags | `early-termination-clause` (clauses page) |
| Rent Escalation Clause — Definition, Risks & Red Flags | `rent-escalation-clause` (clauses page) |
| Security Deposit Clause — Definition, Risks & Red Flags | `security-deposit-clause` (clauses page) |
| Exit Clause — Definition, Risks & Red Flags | `exit-clause` (clauses page) |
| Payment Terms Clause — Definition, Risks & Red Flags | `payment-terms-clause` (clauses page) |
| Scope of Work Clause — Definition, Risks & Red Flags | `scope-of-work-clause` (clauses page) |
| Kill Fee Clause — Definition, Risks & Red Flags | `kill-fee-clause` (clauses page) |
| Intellectual Property Clause — Definition, Risks & Red Flags | `intellectual-property-clause` (clauses page) |

---

## CTA formats (use contextually — never copy-paste robotically)

**In-body blockquote CTA (use 1–2 times per article):**
```markdown
> **Have a [document type] to review?** [Upload it to Contrivox](/#upload-sec)
> for a plain-English breakdown of every clause in under a minute.
```

**Inline mention (softer, use mid-section):**
```markdown
> **Not sure if your [clause type] is aggressive or standard?**
> [Upload your contract to Contrivox](/#upload-sec) for an instant analysis.
```

**Final CTA (bold link, always last before disclaimer):**
```markdown
**[Upload your [contract type] to Contrivox](/#upload-sec) →**
Get a plain-English analysis of every clause — flagged, explained, and scored — in under a minute.
```

---

## Checklist before writing

- [ ] Frontmatter has all required fields (title, slug, metaDescription, primaryKeyword, suggestedCategory, publishedAt, updatedAt, author)
- [ ] `suggestedCategory` matches a valid value exactly
- [ ] Quick summary at top answers the primary keyword question directly
- [ ] First paragraph has no filler opener
- [ ] At least 2 internal links in the body (blog or clause pages)
- [ ] At least one table (red flags, comparison, or quick reference)
- [ ] FAQ section has 4–5 questions targeting PAA / People Also Ask
- [ ] Related guides section present with 2–3 links
- [ ] CTA links to `/#upload-sec` (not just `/`)
- [ ] Final disclaimer present and accurate to the topic
- [ ] Word count matches target for article type

---

## What NOT to do

- Do not start with "In today's complex legal landscape..."
- Do not use "it's important to note that"
- Do not write "as mentioned above" or "as we discussed"
- Do not use passive voice to avoid naming who does what
- Do not pad to hit word count — cut, don't add filler
- Do not invent clause page URLs — only link to clause pages you know exist
- Do not put the Related guides section in the middle of the article
- Do not end FAQ answers with "consult a lawyer" on every question (once is enough, at the end)
- Do not use $9 alone — always write "from $9" or "starting from $9"
