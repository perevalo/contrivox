import type { Metadata } from "next";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ClauseRow } from "@/lib/seo-types";
import { ClauseSearch } from "./ClauseSearch";
import "./clause-styles.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contract Clause Glossary — Definitions, Risks & Red Flags | Contrivox",
  description:
    "Plain-English definitions of 20+ contract clauses — non-compete, NDA, arbitration, IP assignment, and more. Understand what you're signing before you sign it.",
  alternates: { canonical: "https://contrivox.com/clauses" },
  openGraph: {
    title: "Contract Clause Glossary | Contrivox",
    description: "Plain-English definitions of 20+ contract clauses with risks, red flags, and negotiation tips.",
    url: "https://contrivox.com/clauses",
    type: "website",
  },
};

export default async function ClausesIndexPage() {
  const db = createSupabaseServiceClient();

  const { data: raw, error } = await db
    .from("clauses")
    .select("slug, name, category, definition_seed, generated_content, published")
    .eq("published", true)
    .order("name");

  if (error) {
    console.error("[clauses/page] Supabase error:", (error as { message?: string }).message ?? String(error));
  }

  const publishedClauses = (raw as unknown as ClauseRow[]) ?? [];

  return (
    <main className="clause-page">
      {/* Breadcrumb */}
      <nav className="clause-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="sep">›</span>
        <span style={{ color: "var(--cvx-muted)" }}>Clauses</span>
      </nav>

      <h1 className="clause-h1" style={{ marginBottom: 12 }}>
        Contract Clause Glossary
      </h1>
      <p
        style={{
          fontSize: 17,
          color: "var(--cvx-muted)",
          lineHeight: 1.65,
          marginBottom: 36,
          maxWidth: 580,
        }}
      >
        Plain-English definitions of every common contract clause — with real risks,
        red flags, and negotiation tips. No legalese.
      </p>

      {publishedClauses.length === 0 ? (
        <p style={{ color: "var(--cvx-muted)", fontSize: 15 }}>
          No published clauses yet. Run <code>pnpm seo:generate</code> then{" "}
          <code>pnpm seo:review</code> to publish.
        </p>
      ) : (
        <ClauseSearch clauses={publishedClauses} />
      )}
    </main>
  );
}
