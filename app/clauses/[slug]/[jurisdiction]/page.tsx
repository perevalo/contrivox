import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { JurisdictionPageRow, ClauseRow } from "@/lib/seo-types";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema-markup";
import "../../clause-styles.css";

export const revalidate = 3600;
export const dynamicParams = true;

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const db = createSupabaseServiceClient();
  const { data } = await db
    .from("clause_jurisdictions")
    .select("clause_slug, jurisdiction_slug")
    .eq("published", true);
  return (data ?? []).map((r) => ({
    slug:         (r as { clause_slug: string; jurisdiction_slug: string }).clause_slug,
    jurisdiction: (r as { clause_slug: string; jurisdiction_slug: string }).jurisdiction_slug,
  }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string; jurisdiction: string };
}): Promise<Metadata> {
  const db = createSupabaseServiceClient();
  const { data: raw } = await db
    .from("clause_jurisdictions")
    .select("jurisdiction_name, generated_content")
    .eq("clause_slug", params.slug)
    .eq("jurisdiction_slug", params.jurisdiction)
    .eq("published", true)
    .single();

  const row = raw as { jurisdiction_name: string; generated_content: Record<string, unknown> | null } | null;
  if (!row?.generated_content) return {};

  const c = row.generated_content as { meta_title?: string; meta_description?: string };
  const canonical = `https://contrivox.com/clauses/${params.slug}/${params.jurisdiction}`;

  return {
    title:       c.meta_title ?? "",
    description: c.meta_description ?? "",
    alternates:  { canonical },
    openGraph: {
      title:       c.meta_title ?? "",
      description: c.meta_description ?? "",
      url:         canonical,
      type:        "article",
    },
  };
}

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  enforceable:   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", icon: "✅" },
  limited:       { bg: "#fffbeb", color: "#92400e", border: "#fde68a", icon: "⚠️" },
  unenforceable: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca", icon: "🚫" },
  varies:        { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe", icon: "⚖️" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JurisdictionPage({
  params,
}: {
  params: { slug: string; jurisdiction: string };
}) {
  const db = createSupabaseServiceClient();

  const [{ data: rawJD }, { data: rawClause }, { data: rawSiblings }] = await Promise.all([
    db
      .from("clause_jurisdictions")
      .select("*")
      .eq("clause_slug", params.slug)
      .eq("jurisdiction_slug", params.jurisdiction)
      .eq("published", true)
      .single(),
    db
      .from("clauses")
      .select("slug, name, category")
      .eq("slug", params.slug)
      .single(),
    db
      .from("clause_jurisdictions")
      .select("jurisdiction_slug, jurisdiction_name")
      .eq("clause_slug", params.slug)
      .eq("published", true),
  ]);

  const jd = rawJD as unknown as JurisdictionPageRow | null;
  const clause = rawClause as unknown as Pick<ClauseRow, "slug" | "name" | "category"> | null;

  if (!jd?.generated_content || !clause) notFound();

  const c = jd.generated_content;
  const siblings =
    (rawSiblings as unknown as { jurisdiction_slug: string; jurisdiction_name: string }[] | null) ?? [];
  const otherJurisdictions = siblings.filter((s) => s.jurisdiction_slug !== params.jurisdiction);

  const v = VERDICT[c.enforceability.verdict] ?? VERDICT.varies;

  const ldBreadcrumb = breadcrumbSchema([
    { name: "Home",           url: "https://contrivox.com" },
    { name: "Clauses",        url: "https://contrivox.com/clauses" },
    { name: clause.name,      url: `https://contrivox.com/clauses/${params.slug}` },
    { name: jd.jurisdiction_name, url: `https://contrivox.com/clauses/${params.slug}/${params.jurisdiction}` },
  ]);
  const ldFaq = faqPageSchema(c.faqs);

  return (
    <main className="clause-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />

      {/* Breadcrumb */}
      <nav className="clause-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="sep">›</span>
        <a href="/clauses">Clauses</a>
        <span className="sep">›</span>
        <a href={`/clauses/${params.slug}`}>{clause.name}</a>
        <span className="sep">›</span>
        <span style={{ color: "var(--cvx-muted)" }}>{jd.jurisdiction_name}</span>
      </nav>

      <h1 className="clause-h1">{c.h1}</h1>
      <p style={{ fontSize: 17, color: "var(--cvx-muted)", lineHeight: 1.65, marginBottom: 28, maxWidth: 640 }}>
        {c.intro_paragraph}
      </p>

      {/* Enforceability verdict badge */}
      <div
        style={{
          display: "inline-flex", alignItems: "flex-start", gap: 14,
          padding: "16px 20px", borderRadius: 10, marginBottom: 36,
          background: v.bg, border: `1.5px solid ${v.border}`, maxWidth: 560,
        }}
      >
        <span style={{ fontSize: 24, lineHeight: 1 }}>{v.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: v.color, marginBottom: 4 }}>
            {c.enforceability.verdict_label}
          </div>
          <div style={{ fontSize: 14, color: "var(--cvx-text)", lineHeight: 1.6 }}>
            {c.enforceability.explanation}
          </div>
        </div>
      </div>

      {/* Key Rules */}
      <h2 className="clause-section-title">Key Rules in {jd.jurisdiction_name}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
        {c.key_rules.map((r, i) => (
          <div key={i} className="clause-risk-card">
            <strong>{r.rule}</strong>
            <p style={{ margin: "6px 0 0", color: "var(--cvx-text)", fontSize: 14, lineHeight: 1.6 }}>{r.detail}</p>
          </div>
        ))}
      </div>

      {/* How it differs */}
      <h2 className="clause-section-title">How {jd.jurisdiction_name} Differs</h2>
      <p style={{ color: "var(--cvx-text)", lineHeight: 1.7, marginBottom: 28 }}>{c.how_it_differs}</p>

      {/* Recent changes */}
      {c.recent_changes && (
        <>
          <h2 className="clause-section-title">Recent Legal Changes</h2>
          <p style={{ color: "var(--cvx-text)", lineHeight: 1.7, marginBottom: 28 }}>{c.recent_changes}</p>
        </>
      )}

      {/* Negotiation tips */}
      <h2 className="clause-section-title">Negotiation Tips for {jd.jurisdiction_name}</h2>
      <ul className="clause-tips-list" style={{ marginBottom: 36 }}>
        {c.negotiation_tips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>

      {/* FAQ */}
      <h2 className="clause-section-title">Frequently Asked Questions</h2>
      <div className="clause-faq-list" style={{ marginBottom: 40 }}>
        {c.faqs.map((faq, i) => (
          <div key={i} className="clause-faq-item">
            <details>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          </div>
        ))}
      </div>

      {/* Other jurisdictions */}
      {otherJurisdictions.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 className="clause-section-title">{clause.name} in Other Jurisdictions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {otherJurisdictions.map((j) => (
              <a
                key={j.jurisdiction_slug}
                href={`/clauses/${params.slug}/${j.jurisdiction_slug}`}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  background: "var(--cvx-surface)", border: "1px solid var(--cvx-border)",
                  fontSize: 14, color: "var(--cvx-accent)", textDecoration: "none",
                }}
              >
                {j.jurisdiction_name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back to base clause */}
      <p style={{ marginBottom: 40 }}>
        <a href={`/clauses/${params.slug}`} style={{ color: "var(--cvx-accent)", fontSize: 14 }}>
          ← View the full {clause.name} guide
        </a>
      </p>

      {/* CTA */}
      <div className="clause-cta">
        <h2>See How This Clause Appears in Your Contract</h2>
        <p>{c.cta_hook}</p>
        <a href="/" className="clause-cta-btn">Analyse My Contract Free →</a>
      </div>
    </main>
  );
}
