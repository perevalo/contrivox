import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { breadcrumbSchema } from "@/lib/schema-markup";
import "@/app/clauses/clause-styles.css";

export const revalidate = 3600;
export const dynamicParams = true;

const SITE = "https://contrivox.com";

export async function generateStaticParams() {
  const db = createSupabaseServiceClient();
  const { data } = await db
    .from("seo_contracts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

type ContractRow = {
  id: string; slug: string; name: string; category: string | null;
  clause_slugs: string[]; generated_content: Record<string, unknown> | null;
  published: boolean; created_at: string;
};
type ContractClause = {
  slug: string; name: string; category: string | null;
  generated_content: { intro_paragraph?: string } | null; published: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const db = createSupabaseServiceClient();
  const { data: raw } = await db
    .from("seo_contracts")
    .select("slug, name, generated_content")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  const data = raw as unknown as Pick<ContractRow, "slug" | "name" | "generated_content"> | null;

  if (!data) return {};
  const c = data.generated_content as Record<string, string> | null;
  const url = `${SITE}/contracts/${params.slug}`;

  return {
    title: c?.meta_title ?? `${data.name} — Clauses, Risks & What to Watch | Contrivox`,
    description: c?.meta_description ?? `Understand every clause in a ${data.name}. Plain-English guide with risks, red flags, and negotiation tips.`,
    alternates: { canonical: url },
    openGraph: { title: c?.meta_title ?? data.name, url, type: "article" },
  };
}

export default async function ContractPage({
  params,
}: {
  params: { slug: string };
}) {
  const db = createSupabaseServiceClient();

  const { data: rawContract } = await db
    .from("seo_contracts")
    .select("id, slug, name, category, clause_slugs, generated_content")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  const contract = rawContract as unknown as ContractRow | null;

  if (!contract) notFound();

  // Fetch the associated clauses
  const { data: rawClauses } = await db
    .from("clauses")
    .select("slug, name, category, generated_content, published")
    .in("slug", contract.clause_slugs)
    .eq("published", true);
  const clauses = (rawClauses as unknown as ContractClause[]) ?? [];

  const pageUrl = `${SITE}/contracts/${params.slug}`;

  const jsonLdBreadcrumb = breadcrumbSchema([
    { name: "Home", url: SITE },
    { name: "Contracts", url: `${SITE}/contracts` },
    { name: contract.name, url: pageUrl },
  ]);

  const c = contract.generated_content;
  const h1 = (c?.h1 as string | undefined) ?? `${contract.name}: Every Clause Explained`;
  const introParagraph = c?.intro_paragraph as string | undefined;

  return (
    <article className="clause-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* Breadcrumb */}
      <nav className="clause-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="sep">›</span>
        <span style={{ color: "var(--cvx-muted)" }}>{contract.name}</span>
      </nav>

      <h1 className="clause-h1">{h1}</h1>

      {introParagraph && (
        <p className="clause-intro">{introParagraph}</p>
      )}

      {/* CTA */}
      <div className="clause-cta" role="complementary">
        <p className="clause-cta-text">
          Have a {contract.name}? Upload it to Contrivox and get a full analysis with red flags,
          a fairness score, and negotiation scripts in 60 seconds.
        </p>
        <a href="/?ref=contract-cta" className="clause-cta-btn">
          Analyze My Contract →
        </a>
      </div>

      {/* Clause list */}
      {clauses.length > 0 && (
        <section className="clause-section" aria-labelledby="clauses-heading">
          <h2 className="clause-section-title" id="clauses-heading">
            Common Clauses in a {contract.name}
          </h2>
          <p style={{ fontSize: 14, color: "var(--cvx-muted)", marginBottom: 24 }}>
            These are the clauses you are most likely to encounter. Click any clause for a
            full explanation, risks, and negotiation tips.
          </p>
          {clauses.map((clause) => {
            const intro = clause.generated_content?.intro_paragraph;
            return (
              <a
                key={clause.slug}
                href={`/clauses/${clause.slug}`}
                className="clause-index-card"
              >
                <span
                  className={`clause-category-badge badge-${clause.category ?? "general"}`}
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  {clause.category}
                </span>
                <span>
                  <span className="clause-index-name">{clause.name}</span>
                  {intro && <span className="clause-index-teaser">{intro}</span>}
                </span>
              </a>
            );
          })}
        </section>
      )}

      {/* Bottom CTA */}
      <div className="clause-cta" style={{ marginTop: 48 }} role="complementary">
        <p className="clause-cta-text">
          Ready to review your {contract.name}? Contrivox reads the full document and flags
          every risky clause — in plain English.
        </p>
        <a href="/?ref=contract-bottom-cta" className="clause-cta-btn">
          Get Your Analysis →
        </a>
      </div>
    </article>
  );
}
