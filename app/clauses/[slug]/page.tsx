import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { faqPageSchema, breadcrumbSchema, definedTermSchema } from "@/lib/schema-markup";
import { injectInternalLinks } from "@/lib/internal-links";
import type { ClauseRow, ClauseContent } from "@/lib/seo-types";
import "../clause-styles.css";

export const revalidate = 3600;
export const dynamicParams = true;

const SITE = "https://contrivox.com";

export async function generateStaticParams() {
  const db = createSupabaseServiceClient();
  const { data } = await db
    .from("clauses")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const db = createSupabaseServiceClient();
  const { data: raw } = await db
    .from("clauses")
    .select("slug, name, generated_content")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  const data = raw as unknown as { slug: string; name: string; generated_content: ClauseContent | null } | null;

  if (!data?.generated_content) return {};
  const c = data.generated_content as ClauseContent;
  const url = `${SITE}/clauses/${params.slug}`;

  return {
    title: c.meta_title,
    description: c.meta_description,
    alternates: { canonical: url },
    openGraph: {
      title: c.meta_title,
      description: c.meta_description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta_title,
      description: c.meta_description,
    },
  };
}

export default async function ClausePage({
  params,
}: {
  params: { slug: string };
}) {
  const db = createSupabaseServiceClient();

  // Fetch the requested clause
  const { data: rawClause } = await db
    .from("clauses")
    .select(
      "id, slug, name, also_known_as, category, definition_seed, " +
      "key_risks, related_clause_slugs, jurisdictions, generated_content, " +
      "published, created_at"
    )
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  const clause = rawClause as unknown as ClauseRow | null;

  if (!clause?.generated_content) notFound();

  const c = clause.generated_content as ClauseContent;

  // Fetch related clauses for internal linking + pills
  const { data: rawAll } = await db
    .from("clauses")
    .select("slug, name, also_known_as")
    .eq("published", true);
  const allClauses = (rawAll as unknown as Pick<ClauseRow, "slug" | "name" | "also_known_as">[]) ?? [];

  const related = allClauses.filter((cl) =>
    clause.related_clause_slugs.includes(cl.slug)
  );

  const linkableClauses = allClauses;

  // Inject internal links into prose fields
  const introHtml = injectInternalLinks(c.intro_paragraph, clause.slug, linkableClauses);
  const plainEnglishHtml = injectInternalLinks(
    c.definition.plain_english,
    clause.slug,
    linkableClauses
  );
  const enforceabilityHtml = injectInternalLinks(
    c.enforceability.overview,
    clause.slug,
    linkableClauses
  );

  const pageUrl = `${SITE}/clauses/${clause.slug}`;
  const categoryLabel =
    { employment: "Employment", freelance: "Freelance", commercial: "Commercial",
      ip: "Intellectual Property", general: "General" }[clause.category ?? "general"] ??
    "General";

  const jsonLdFaq = faqPageSchema(c.faqs);
  const jsonLdBreadcrumb = breadcrumbSchema([
    { name: "Home", url: SITE },
    { name: "Clauses", url: `${SITE}/clauses` },
    { name: clause.name, url: pageUrl },
  ]);
  const jsonLdTerm = definedTermSchema({
    name: clause.name,
    plainEnglish: c.definition.plain_english,
    slug: clause.slug,
  });

  return (
    <article className="clause-page">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTerm) }} />

      {/* Breadcrumb */}
      <nav className="clause-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="sep">›</span>
        <a href="/clauses">Clauses</a>
        <span className="sep">›</span>
        <span style={{ color: "var(--cvx-muted)" }}>{clause.name}</span>
      </nav>

      {/* Category + H1 */}
      <span className={`clause-category-badge badge-${clause.category ?? "general"}`}>
        {categoryLabel}
      </span>
      <h1 className="clause-h1">{c.h1}</h1>

      {/* Intro */}
      <p
        className="clause-intro"
        dangerouslySetInnerHTML={{ __html: introHtml }}
      />

      {/* CTA #1 — after intro */}
      <CtaBlock hook={c.cta_hook} />

      {/* ── Definition ─────────────────────────────────── */}
      <section className="clause-section" aria-labelledby="definition-heading">
        <h2 className="clause-section-title" id="definition-heading">
          What Is a {clause.name}?
        </h2>
        <div className="clause-definition-grid">
          <div className="clause-definition-card">
            <h3>Plain English</h3>
            <p dangerouslySetInnerHTML={{ __html: plainEnglishHtml }} />
          </div>
          <div className="clause-definition-card">
            <h3>Legal Context</h3>
            <p>{c.definition.legal_context}</p>
          </div>
        </div>
      </section>

      {/* ── How it appears ─────────────────────────────── */}
      <section className="clause-section" aria-labelledby="appears-heading">
        <h2 className="clause-section-title" id="appears-heading">
          How It Appears in Contracts
        </h2>
        <p style={{ fontSize: 15, color: "var(--cvx-muted)", lineHeight: 1.65, marginBottom: 12 }}>
          {c.how_it_appears.description}
        </p>
        <div className="clause-example-block">
          <div className="clause-example-label">Example language (illustrative only — not legal advice)</div>
          {c.how_it_appears.example_language}
        </div>
        {c.how_it_appears.what_to_look_for.length > 0 && (
          <>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cvx-heading)", marginTop: 20, marginBottom: 8 }}>
              What to look for in the actual clause text:
            </p>
            <ul className="clause-look-for-list">
              {c.how_it_appears.what_to_look_for.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ── Risks & Red Flags ──────────────────────────── */}
      <section className="clause-section" aria-labelledby="risks-heading">
        <h2 className="clause-section-title" id="risks-heading">
          Risks &amp; Red Flags
        </h2>
        {c.risks_and_red_flags.map((risk, i) => (
          <div key={i} className="clause-risk-card">
            <p className="clause-risk-flag">{risk.flag}</p>
            <p className="clause-risk-explanation">{risk.explanation}</p>
          </div>
        ))}
      </section>

      {/* ── Enforceability ─────────────────────────────── */}
      <section className="clause-section" aria-labelledby="enforceability-heading">
        <h2 className="clause-section-title" id="enforceability-heading">
          Enforceability
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--cvx-text)", marginBottom: 12 }}
          dangerouslySetInnerHTML={{ __html: enforceabilityHtml }}
        />
        {c.enforceability.varies_by_jurisdiction && (
          <div className="clause-enforceability-note">
            <div className="clause-varies-badge">Varies by jurisdiction</div>
            <p>{c.enforceability.jurisdiction_notes}</p>
          </div>
        )}
      </section>

      {/* ── Negotiation Tips ───────────────────────────── */}
      <section className="clause-section" aria-labelledby="tips-heading">
        <h2 className="clause-section-title" id="tips-heading">
          Negotiation Tips
        </h2>
        <ol className="clause-tips-list">
          {c.negotiation_tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ol>
      </section>

      {/* CTA #2 — above FAQ */}
      <CtaBlock hook={c.cta_hook} />

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="clause-section" aria-labelledby="faq-heading">
        <h2 className="clause-section-title" id="faq-heading">
          Frequently Asked Questions
        </h2>
        {c.faqs.map((faq, i) => (
          <details key={i} className="clause-faq-item">
            <summary>{faq.question}</summary>
            <p className="clause-faq-answer">{faq.answer}</p>
          </details>
        ))}
      </section>

      {/* ── Related Clauses ────────────────────────────── */}
      {related.length > 0 && (
        <section className="clause-section" aria-labelledby="related-heading">
          <h2
            className="clause-section-title"
            id="related-heading"
            style={{ marginBottom: 12 }}
          >
            Related Clauses
          </h2>
          <div className="clause-related">
            {related.map((rel) => (
              <a key={rel.slug} href={`/clauses/${rel.slug}`} className="clause-related-pill">
                {rel.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function CtaBlock({ hook }: { hook: string }) {
  return (
    <div className="clause-cta" role="complementary">
      <p className="clause-cta-text">{hook}</p>
      <a href="/?ref=clause-cta" className="clause-cta-btn">
        Analyze My Contract →
      </a>
    </div>
  );
}
