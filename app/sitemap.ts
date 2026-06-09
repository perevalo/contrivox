import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const revalidate = 3600;

// Update these when the page content actually changes
const STATIC_DATES = {
  contact: "2026-05-18",
  privacy: "2026-05-18",
  terms:   "2026-05-18",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  const base  = "https://contrivox.com";

  const db = createSupabaseServiceClient();
  const [{ data: clauses }, { data: contracts }, { data: jurisdictions }] = await Promise.all([
    db.from("clauses").select("slug, generated_at, created_at").eq("published", true),
    db.from("seo_contracts").select("slug, created_at").eq("published", true),
    db.from("clause_jurisdictions").select("clause_slug, jurisdiction_slug, generated_at, created_at").eq("published", true),
  ]);

  // Remove shorter slug when both "X" and "X-clause" exist — keep the more descriptive one
  const clauseSlugSet = new Set((clauses ?? []).map((c) => c.slug));
  const dedupedClauses = (clauses ?? []).filter(
    (c) => !clauseSlugSet.has(`${c.slug}-clause`)
  );

  const clauseUrls: MetadataRoute.Sitemap = dedupedClauses.map((c) => ({
    url: `${base}/clauses/${c.slug}`,
    lastModified: new Date(c.generated_at ?? c.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const jurisdictionUrls: MetadataRoute.Sitemap = (jurisdictions ?? []).map((j) => {
    const jj = j as { clause_slug: string; jurisdiction_slug: string; generated_at: string | null; created_at: string };
    return {
      url: `${base}/clauses/${jj.clause_slug}/${jj.jurisdiction_slug}`,
      lastModified: new Date(jj.generated_at ?? jj.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    };
  });

  const contractUrls: MetadataRoute.Sitemap = (contracts ?? []).map((c) => ({
    url: `${base}/contracts/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Derive lastmod for index pages from most recent child content
  const fallback = new Date(STATIC_DATES.contact);
  const mostRecentPost = posts.length > 0
    ? new Date(Math.max(...posts.map((p) => new Date(p.updatedAt).getTime())))
    : fallback;
  const mostRecentClause = dedupedClauses.length > 0
    ? new Date(Math.max(...dedupedClauses.map((c) => new Date(c.generated_at ?? c.created_at).getTime())))
    : fallback;
  const mostRecentContent = new Date(Math.max(mostRecentPost.getTime(), mostRecentClause.getTime()));

  return [
    { url: base,              lastModified: mostRecentContent,                  changeFrequency: "weekly"  as const, priority: 1.0 },
    { url: `${base}/blog`,    lastModified: mostRecentPost,                     changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: `${base}/clauses`, lastModified: mostRecentClause,                   changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(STATIC_DATES.contact),    changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(STATIC_DATES.privacy),    changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/terms`,   lastModified: new Date(STATIC_DATES.terms),      changeFrequency: "monthly" as const, priority: 0.3 },
    ...postUrls,
    ...clauseUrls,
    ...jurisdictionUrls,
    ...contractUrls,
  ];
}
