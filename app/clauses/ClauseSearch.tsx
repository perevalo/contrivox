"use client";

import { useState } from "react";
import type { ClauseRow } from "@/lib/seo-types";

const CATEGORY_LABELS: Record<string, string> = {
  employment: "Employment",
  freelance:  "Freelance",
  commercial: "Commercial",
  ip:         "Intellectual Property",
  general:    "General",
};

type Props = {
  clauses: Pick<ClauseRow, "slug" | "name" | "category" | "definition_seed" | "generated_content">[];
};

export function ClauseSearch({ clauses }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? clauses.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.slug.replace(/-/g, " ").includes(q) ||
          (c.definition_seed ?? "").toLowerCase().includes(q)
        );
      })
    : clauses;

  const byCategory: Record<string, typeof filtered> = {};
  for (const clause of filtered) {
    const cat = clause.category ?? "general";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(clause);
  }

  const categoryOrder = ["employment", "freelance", "commercial", "ip", "general"];
  const categories = categoryOrder.filter((c) => byCategory[c]?.length);

  return (
    <>
      <input
        className="clause-search-input"
        type="search"
        placeholder="Search clauses… e.g. non-compete, NDA, arbitration"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search contract clauses"
      />

      {filtered.length === 0 ? (
        <p style={{ color: "var(--cvx-muted)", fontSize: 15 }}>
          No clauses match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="clause-category-group">
            <h2 className="clause-category-group-title">
              {CATEGORY_LABELS[cat] ?? cat} ({byCategory[cat].length})
            </h2>
            {byCategory[cat].map((clause) => {
              const teaser =
                (clause.generated_content as { intro_paragraph?: string } | null)
                  ?.intro_paragraph ??
                clause.definition_seed ??
                "";
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
                    {CATEGORY_LABELS[clause.category ?? "general"]}
                  </span>
                  <span>
                    <span className="clause-index-name">{clause.name}</span>
                    {teaser && (
                      <span className="clause-index-teaser">{teaser}</span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        ))
      )}
    </>
  );
}
