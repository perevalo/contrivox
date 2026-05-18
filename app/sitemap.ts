import { MetadataRoute } from "next";
import { getAllPosts, getAllCategories } from "@/lib/strapi";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    getAllPosts().catch(() => []),
    getAllCategories().catch(() => []),
  ]);
  const base = "https://contrivox.com";

  const postUrls = posts.map(p => ({
    url: `${base}/blog/${p.attributes.slug}`,
    lastModified: new Date(p.attributes.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const catUrls = categories.map(c => ({
    url: `${base}/blog/category/${c.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: base,            lastModified: new Date(), changeFrequency: "weekly", priority: 1   },
    { url: `${base}/blog`,  lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    ...postUrls,
    ...catUrls,
  ];
}
