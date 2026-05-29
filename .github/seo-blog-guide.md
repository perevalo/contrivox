# SEO Blog Article Generator — How to Use

The `SEO Blog Articles` GitHub Actions workflow uses Claude (Sonnet) to write
full markdown blog posts from structured specs you define in code. Each run
commits the generated articles directly to `content/blog/` and triggers a
Vercel redeploy.

---

## How it works end-to-end

```
You define an article spec → GitHub Actions runs → Claude writes the article
→ markdown saved to content/blog/ → auto-committed to main → Vercel redeploys
→ article goes live at contrivox.com/blog/<slug>
```

No manual copy-paste. No local setup needed to generate articles.

---

## Prerequisites (one-time setup)

Two secrets must exist in the GitHub repo before the workflow will succeed.

Go to: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | What it is | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com → API Keys |
| `VERCEL_DEPLOY_HOOK` | Vercel deploy hook URL | Vercel → Project → Settings → Git → Deploy Hooks |

`VERCEL_DEPLOY_HOOK` is optional — if absent the workflow skips the redeploy
step and Vercel's normal git integration picks it up on the next push anyway.

---

## Running the workflow (step by step)

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. In the left sidebar, click **SEO Blog Articles**
4. Click **Run workflow** (top-right, next to the branch selector)
5. Fill in the inputs:

   **filter** *(optional)*
   Leave blank to generate all articles that don't exist yet.
   Type a keyword to target one article — e.g. `freelance`, `nda`, `saas`.
   Matches against slug and primary keyword.

   **force** *(optional, default: false)*
   Set to `true` to overwrite articles that already exist on disk.
   Use this when you've updated a spec and want to regenerate.

6. Click **Run workflow** — the green button

The job takes 3–8 minutes depending on how many articles it generates.
Watch progress under **Actions → SEO Blog Articles → (latest run)**.

---

## What gets generated

For each article spec in `scripts/generate-blog-articles.ts`, Claude writes a
complete markdown file with:

- Full YAML frontmatter (title, slug, metaDescription, keywords, dates, etc.)
- Hook paragraph, H2/H3 structure, practical examples
- 8+ internal links to `/clauses/` pages (passed in the spec)
- A quick-reference table
- FAQ section (5–7 questions) for FAQPage schema and People Also Ask
- CTA paragraph linking to Contrivox
- Disclaimer line

The file is saved as `content/blog/<slug>.md` and appears automatically at
`/blog/<slug>` on the next deploy — no code changes needed.

---

## Adding a new article

Edit `scripts/generate-blog-articles.ts` and add an entry to the `ARTICLES`
array. Each spec has these fields:

```typescript
{
  slug: "your-article-slug",
  // Becomes the URL: /blog/your-article-slug

  title: "Full Article Title for H1 and Frontmatter",

  metaDescription: "150-160 character meta description targeting the keyword.",

  primaryKeyword: "the exact search phrase you want to rank for",

  secondaryKeywords: [
    "related phrase one",
    "related phrase two",
    "related phrase three",
  ],

  category: "NDAs",
  // Must match an existing category in lib/blog.ts CATEGORY_META:
  // "Rental Contracts" | "Employment" | "NDAs" | "Contract Clauses"
  // | "Business Contracts" | "Freelance" | "AI & Technology"

  angle: "One paragraph describing the writing angle — who the reader is, what they need, what tone to take, what the article should accomplish.",

  clauseLinks: {
    // Display name → internal URL
    // These are linked naturally within the article body
    "Non-Compete Clause": "/clauses/non-compete-clause",
    "Termination Clause": "/clauses/termination-clause",
    // Add 6-10 clause links per article
  },

  targetWordCount: 2000,
  // Aim for 1500–2500. Claude will try to hit this number.
}
```

After editing the file, commit and push to main — then trigger the workflow
from GitHub Actions.

---

## Running locally (for testing)

Test a single article before committing the spec:

```bash
# Install deps first
pnpm install

# Generate one article by slug keyword (does NOT commit)
ANTHROPIC_API_KEY=sk-ant-... pnpm exec tsx scripts/generate-blog-articles.ts freelance

# Generate all articles not yet on disk
ANTHROPIC_API_KEY=sk-ant-... pnpm exec tsx scripts/generate-blog-articles.ts

# Overwrite an existing article to test a new spec
ANTHROPIC_API_KEY=sk-ant-... pnpm exec tsx scripts/generate-blog-articles.ts nda --force
```

Generated files land in `content/blog/`. Review them, edit if needed, then
commit manually.

---

## Regenerating an existing article

If a spec changes (better angle, new clause links, higher word count) and you
want a fresh article:

**Via GitHub Actions:** Run workflow → set `filter` to the slug keyword → set
`force` to `true`.

**Locally:** Run with `--force` flag (see above), review the output, commit.

---

## Customising the prompt

The Claude prompt is built in `scripts/generate-blog-articles.ts` inside two
places:

**`SYSTEM_PROMPT`** (line ~192) — controls Claude's persona and writing rules.
Edit this to change the overall voice, add restrictions, or adjust quality
guidelines.

**`buildPrompt()`** (line ~199) — builds the per-article user prompt. Edit the
numbered requirements list to change what every article must include (e.g. add
a "Bottom line" box, change FAQ count, require a specific CTA format).

After editing, test locally before pushing.

---

## After articles are generated

1. The workflow commits the new `.md` files to `main` with a standard commit
   message: `feat(blog): auto-generate SEO articles linking to clause pages`
2. If `VERCEL_DEPLOY_HOOK` is set, Vercel redeploys immediately
3. Articles appear at `contrivox.com/blog/<slug>` within 1–2 minutes of deploy
4. The blog index at `/blog` picks them up automatically — no code changes needed

---

## Troubleshooting

**Workflow fails at "Generate articles"**
- Check that `ANTHROPIC_API_KEY` secret is set and valid
- Check the Actions log for the specific Claude error (rate limit, overload, bad prompt)
- Rate limit (429): wait a few minutes and re-run

**Article already exists, new run skips it**
- Set `force` to `true` when running the workflow, or use `--force` locally

**Generated article has wrong category / doesn't appear on blog**
- Check the `suggestedCategory` in the frontmatter matches a key in `lib/blog.ts` CATEGORY_META exactly (case-sensitive)
- Valid values: `Rental Contracts`, `Employment`, `NDAs`, `Contract Clauses`, `Business Contracts`, `Freelance`, `AI & Technology`

**Article appears but isn't indexed on Google**
- Submit the URL in Google Search Console → URL Inspection → Request Indexing
- Check `/sitemap.xml` includes the new slug

**Vercel redeploy not triggered**
- Check `VERCEL_DEPLOY_HOOK` secret is set to the full hook URL (starts with `https://api.vercel.com/v1/integrations/deploy/...`)
- Vercel's normal git integration will still pick up the commit on the next push

---

## Current article specs

Eight articles are pre-defined in the script. Run the workflow with no filter
to generate all of them at once:

| Slug | Primary keyword | Category |
|---|---|---|
| `how-to-review-freelance-contract` | how to review a freelance contract | Freelance |
| `employment-contract-red-flags` | employment contract red flags | Employment |
| `is-non-compete-enforceable` | is non compete clause enforceable | Contract Clauses |
| `nda-guide-what-you-are-agreeing-to` | what does an nda mean | NDAs |
| `ip-assignment-employment-what-you-give-up` | ip assignment clause employment | Employment |
| `force-majeure-clause-explained` | force majeure clause explained | Contract Clauses |
| `saas-contract-clauses-guide` | saas contract clauses | Business Contracts |
| `arbitration-vs-court-what-your-contract-means` | arbitration clause contract | Contract Clauses |

Note: `employment-contract-red-flags` already exists as a hand-written article.
The workflow will skip it unless you run with `force: true`.
