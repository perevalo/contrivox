const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

const headers = {
  Authorization: `Bearer ${STRAPI_TOKEN}`,
  "Content-Type": "application/json",
};

export interface StrapiPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt: string;
    body: object;
    cover: { data: { attributes: { url: string; alternativeText: string } } | null };
    category: { data: { attributes: { name: string; slug: string; color: string } } | null };
    tags: { data: Array<{ id: number; attributes: { name: string; slug: string } }> };
    author: {
      data: {
        attributes: {
          name: string;
          bio: string;
          avatar: { data: { attributes: { url: string } } | null };
          twitter: string;
          linkedin: string;
        };
      } | null;
    };
    featured: boolean;
    reading_time: number | null;
    seo: {
      metaTitle: string;
      metaDescription: string;
      canonicalURL: string | null;
      metaImage: { data: { attributes: { url: string } } | null };
    } | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiCategory {
  id: number;
  attributes: { name: string; slug: string; color: string; description: string };
}

async function fetchStrapi<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Strapi fetch failed: ${path} (${res.status})`);
  return res.json();
}

export async function getAllPosts(): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    "/posts?populate[cover]=*&populate[category]=*&populate[tags]=*&populate[author][populate]=avatar&sort=publishedAt:desc&pagination[pageSize]=100"
  );
  return data.data;
}

export async function getPostBySlug(slug: string): Promise<StrapiPost | null> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    `/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[cover]=*&populate[category]=*&populate[tags]=*&populate[author][populate]=avatar&populate[seo][populate]=metaImage`
  );
  return data.data[0] ?? null;
}

export async function getPostsByCategory(categorySlug: string): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    `/posts?filters[category][slug][$eq]=${encodeURIComponent(categorySlug)}&populate[cover]=*&populate[category]=*&populate[author][populate]=avatar&sort=publishedAt:desc`
  );
  return data.data;
}

export async function getFeaturedPosts(): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    "/posts?filters[featured][$eq]=true&populate[cover]=*&populate[category]=*&populate[author][populate]=avatar&sort=publishedAt:desc&pagination[pageSize]=3"
  );
  return data.data;
}

export async function getAllCategories(): Promise<StrapiCategory[]> {
  const data = await fetchStrapi<{ data: StrapiCategory[] }>("/categories?sort=name:asc");
  return data.data;
}

export function getStrapiImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-blog.jpg";
  if (path.startsWith("http")) return path;
  return `${STRAPI_URL}${path}`;
}

export function calcReadingTime(body: object): number {
  const text = JSON.stringify(body).replace(/"type":"[^"]+"/g, "").replace(/[^a-zA-Z\s]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(dateString: string, locale = "en-US"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}
