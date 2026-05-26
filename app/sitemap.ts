import { MetadataRoute } from "next";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts      = getAllPosts();
  const categories = getAllCategories();
  const base       = "https://contrivox.com";

  // Fetch published SEO pages from Supabase
  const db = createSupabaseServiceClient();
  const [{ data: clauses }, { data: contracts }, { data: jurisdictions }] = await Promise.all([
    db.from("clauses").select("slug, generated_at, created_at").eq("published", true),
    db.from("seo_contracts").select("slug, created_at").eq("published", true),
    db.from("clause_jurisdictions").select("clause_slug, jurisdiction_slug, generated_at, created_at").eq("published", true),
  ]);

  const clauseUrls: MetadataRoute.Sitemap = (clauses ?? []).map((c) => ({
    url: `${base}/clauses/${c.slug}`,
    lastModified: new Date(c.generated_at ?? c.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const jurisdictionUrls: MetadataRoute.Sitemap = (jurisdictions ?? []).map((j) => ({
    url: `${base}/clauses/${(j as { clause_slug: string; jurisdiction_slug: string; generated_at: string | null; created_at: string }).clause_slug}/${(j as { clause_slug: string; jurisdiction_slug: string; generated_at: string | null; created_at: string }).jurisdiction_slug}`,
    lastModified: new Date((j as { generated_at: string | null; created_at: string }).generated_at ?? (j as { created_at: string }).created_at),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const contractUrls: MetadataRoute.Sitemap = (contracts ?? []).map((c) => ({
    url: `${base}/contracts/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const postUrls = posts.map(p => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const catUrls = categories.map(c => ({
    url: `${base}/blog/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: base,                        lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 1   },
    { url: `${base}/sample-report`,     lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/blog`,              lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: `${base}/clauses`,           lastModified: new Date(), changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: `${base}/contact`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/privacy`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/terms`,             lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    ...postUrls,
    ...catUrls,
    ...clauseUrls,
    ...jurisdictionUrls,
    ...contractUrls,
  ];
}
