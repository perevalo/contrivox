import { MetadataRoute } from "next";
import { getAllPosts, getAllCategories } from "@/lib/blog";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts      = getAllPosts();
  const categories = getAllCategories();
  const base       = "https://contrivox.com";

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
    { url: `${base}/contact`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/privacy`,           lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/terms`,             lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    ...postUrls,
    ...catUrls,
  ];
}
