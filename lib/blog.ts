import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

const CATEGORY_META: Record<string, { slug: string; color: string; description: string }> = {
  "Rental Contracts":   { slug: "rental-contracts",  color: "#ef4444", description: "Guides to understanding and reviewing rental and lease agreements." },
  "Employment":         { slug: "employment",         color: "#f59e0b", description: "Employment contracts, job offer reviews, and workplace rights." },
  "NDAs":               { slug: "ndas",               color: "#8b5cf6", description: "Non-disclosure agreements explained in plain English." },
  "Contract Clauses":   { slug: "contract-clauses",   color: "#06b6d4", description: "Common contract clauses explained simply." },
  "Business Contracts": { slug: "business-contracts", color: "#10b981", description: "Service agreements and business contracts for owners and freelancers." },
  "Freelance":          { slug: "freelance",          color: "#f97316", description: "Contract guides for independent contractors and freelancers." },
  "AI & Technology":    { slug: "ai-technology",      color: "#6366f1", description: "How AI tools can help you understand legal documents." },
};

export interface BlogCategory {
  slug: string;
  name: string;
  color: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  category: BlogCategory | null;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  coverImage: string | null;
  keywords: string[];
  author: string;
  seo: { metaTitle: string; metaDescription: string; canonicalURL: string };
  readingTime: number;
}

function calcReadingTime(md: string): number {
  const words = md.replace(/[^a-zA-Z\s]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Returns null for draft posts (missing publishedAt) or future-dated posts
function parsePost(filename: string): BlogPost | null {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const publishedAt = (data.publishedAt as string) || "";
  if (!publishedAt) return null;
  // Hide future-scheduled articles until their publish date
  if (new Date(publishedAt) > new Date()) return null;

  const slug = (data.slug as string) || filename.replace(/\.md$/, "");
  const catName = data.suggestedCategory as string | undefined;
  const catMeta = catName ? CATEGORY_META[catName] : undefined;
  const category: BlogCategory | null = catMeta && catName
    ? { slug: catMeta.slug, name: catName, color: catMeta.color, description: catMeta.description }
    : null;

  const primaryKeyword = data.primaryKeyword as string | undefined;
  const secondaryKeywords = (data.secondaryKeywords as string[] | undefined) ?? [];
  const keywords = primaryKeyword ? [primaryKeyword, ...secondaryKeywords] : secondaryKeywords;

  return {
    slug,
    title: (data.title as string) ?? slug,
    excerpt: (data.metaDescription as string) ?? "",
    bodyHtml: String(marked.parse(content)),
    category,
    featured: Boolean(data.featured),
    publishedAt,
    updatedAt: (data.updatedAt as string) || publishedAt,
    coverImage: (data.coverImage as string) ?? null,
    keywords,
    author: (data.author as string) || "Contrivox Editorial Team",
    seo: {
      metaTitle: (data.metaTitle as string) || (data.title as string) || slug,
      metaDescription: (data.metaDescription as string) ?? "",
      canonicalURL: `https://contrivox.com/blog/${slug}`,
    },
    readingTime: calcReadingTime(content),
  };
}

function loadAll(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => parsePost(f))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getAllPosts(): BlogPost[] {
  return loadAll();
}

export function getPostBySlug(slug: string): BlogPost | null {
  return loadAll().find(p => p.slug === slug) ?? null;
}

export function getFeaturedPosts(): BlogPost[] {
  return loadAll().filter(p => p.featured).slice(0, 3);
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return loadAll().filter(p => p.category?.slug === categorySlug);
}

export function getAllCategories(): BlogCategory[] {
  const seen = new Set<string>();
  const cats: BlogCategory[] = [];
  for (const p of loadAll()) {
    if (p.category && !seen.has(p.category.slug)) {
      seen.add(p.category.slug);
      cats.push(p.category);
    }
  }
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatDate(dateStr: string, locale = "en-US"): string {
  return new Date(dateStr).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
