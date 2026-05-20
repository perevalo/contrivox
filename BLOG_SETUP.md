# BLOG_SETUP.md — Contrivox Blog with Strapi CMS
# Instructions for Claude Code
# Read entirely before writing any code. Execute sections in order.

---

## OVERVIEW

Build a full SEO-optimised blog for Contrivox using:
- Strapi v4 as headless CMS (runs separately, port 1337)
- Next.js 14 App Router consuming Strapi REST API
- ISR (Incremental Static Regeneration) for performance
- Strapi webhook → Next.js revalidation on publish
- Auto-generated sitemap, RSS feed, OG tags, schema.org JSON-LD
- Inline email capture CTA on every post
- US-market content categories pre-seeded

The blog lives at contrivox.com/blog — same Next.js repo, new routes.

---

## SECTION 1 — STRAPI INSTALLATION (run once, separate terminal)

### 1.1 Create Strapi project

Open a NEW terminal alongside the Next.js repo:

```bash
# In the parent directory of your contrivox repo
cd ..
npx create-strapi-app@latest contrivox-cms \
  --quickstart \
  --no-run
cd contrivox-cms
```

### 1.2 Install required Strapi plugins

```bash
npm install \
  @strapi/plugin-seo \
  @strapi/plugin-slugify \
  @strapi/plugin-color-picker
```

### 1.3 Configure Strapi environment

Create `contrivox-cms/.env`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2,toBeModified3,toBeModified4
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified
JWT_SECRET=toBeModified
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Add after setup:
NEXT_REVALIDATE_SECRET=generate-a-random-32-char-string-here
NEXT_PUBLIC_URL=http://localhost:3000
```

Generate real secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run that 4 times and replace each `toBeModified` value.

### 1.4 Configure plugins

Create `contrivox-cms/config/plugins.ts`:

```typescript
export default ({ env }) => ({
  seo: { enabled: true },
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        post: {
          field: "slug",
          references: "title",
        },
        category: {
          field: "slug",
          references: "name",
        },
        tag: {
          field: "slug",
          references: "name",
        },
      },
    },
  },
  "color-picker": { enabled: true },
});
```

### 1.5 Start Strapi

```bash
npm run develop
```

Strapi admin opens at http://localhost:1337/admin
Create your admin account on first launch.

---

## SECTION 2 — STRAPI CONTENT TYPES

Build these 4 content types in Strapi admin → Content-Type Builder.
Create them in this order (Category and Tag must exist before Post).

### 2.1 Category content type

Name: `Category` (collection type)

Fields:
| Field name | Type | Options |
|---|---|---|
| name | Short text | Required |
| slug | UID | Target: name, Required |
| description | Long text | |
| color | String | Use color-picker plugin |
| posts | Relation | Category has many Posts |

### 2.2 Tag content type

Name: `Tag` (collection type)

Fields:
| Field name | Type | Options |
|---|---|---|
| name | Short text | Required |
| slug | UID | Target: name, Required |
| posts | Relation | Tag has many Posts |

### 2.3 Author content type

Name: `Author` (collection type)

Fields:
| Field name | Type | Options |
|---|---|---|
| name | Short text | Required |
| slug | UID | Target: name, Required |
| bio | Long text | |
| avatar | Media | Single image |
| twitter | Short text | |
| linkedin | Short text | |
| posts | Relation | Author has many Posts |

### 2.4 Post content type (main)

Name: `Post` (collection type)

Fields:
| Field name | Type | Options |
|---|---|---|
| title | Short text | Required |
| slug | UID | Target: title, Required |
| excerpt | Long text | Required, shown on index |
| body | Rich text (Blocks) | Required |
| cover | Media | Single image |
| category | Relation | Post belongs to one Category |
| tags | Relation | Post has many Tags (and Tags have many Posts) |
| author | Relation | Post belongs to one Author |
| reading_time | Integer | Minutes, auto-calculate on frontend |
| featured | Boolean | Default false |
| seo | Component | Use SEO plugin component |
| publishedAt | DateTime | Auto-managed by Strapi |

### 2.5 Set API permissions

Strapi admin → Settings → Users & Permissions → Roles → Public:

Enable for Public role (read-only, no auth required):
- Post: find, findOne
- Category: find, findOne
- Tag: find, findOne
- Author: find, findOne
- Upload: find (for media)

### 2.6 Create API token

Strapi admin → Settings → API Tokens → Create new token:
- Name: `next-blog`
- Token type: `Read-only`
- Copy the token — you'll need it for Next.js env vars

### 2.7 Configure webhook

Strapi admin → Settings → Webhooks → Create new webhook:
- Name: `next-revalidate`
- URL: `http://localhost:3000/api/revalidate`
  (in production: `https://contrivox.com/api/revalidate`)
- Events: check `Entry > Create`, `Entry > Update`, `Entry > Publish`
- Headers: `x-revalidate-secret: YOUR_REVALIDATE_SECRET`

### 2.8 Seed initial content

After setting up content types, create these categories:
1. Non-Compete Guides (slug: non-compete-guides, color: #ef4444)
2. Employment Contracts (slug: employment-contracts, color: #7c3aed)
3. Apartment Leases (slug: apartment-leases, color: #0891b2)
4. Freelance & Contractors (slug: freelance-contractors, color: #16a34a)
5. NDA & Confidentiality (slug: nda-confidentiality, color: #d97706)
6. Know Your Rights (slug: know-your-rights, color: #dc2626)

Create 3 seed posts (publish immediately so the blog isn't empty at launch):
1. "Is My Non-Compete Enforceable? A State-by-State Guide" → category: Non-Compete Guides
2. "10 Red Flags in Employment Contracts You Should Never Ignore" → category: Employment Contracts
3. "What to Look for Before Signing an Apartment Lease" → category: Apartment Leases

---

## SECTION 3 — NEXT.JS ENVIRONMENT VARIABLES

Add to `contrivox-repo/.env.local`:

```env
# Strapi CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=paste-the-token-from-step-2-6-here
NEXT_REVALIDATE_SECRET=same-secret-as-in-strapi-env
```

Add to `.env.example` (no real values):
```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
NEXT_REVALIDATE_SECRET=your-revalidation-secret
```

---

## SECTION 4 — NEXT.JS LIBRARY FILES

### 4.1 Create `lib/strapi.ts`

This is the single file that all blog pages import. All Strapi API calls go here.

```typescript
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
    body: object; // Strapi Blocks format
    cover: { data: { attributes: { url: string; alternativeText: string } } | null };
    category: { data: { attributes: { name: string; slug: string; color: string } } | null };
    tags: { data: Array<{ attributes: { name: string; slug: string } }> };
    author: { data: { attributes: { name: string; bio: string; avatar: { data: { attributes: { url: string } } | null }; twitter: string; linkedin: string } } | null };
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
    next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
  });
  if (!res.ok) throw new Error(`Strapi fetch failed: ${path} (${res.status})`);
  return res.json();
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    "/posts?populate[cover]=*&populate[category]=*&populate[tags]=*&populate[author][populate]=avatar&sort=publishedAt:desc&pagination[pageSize]=100"
  );
  return data.data;
}

export async function getPostBySlug(slug: string): Promise<StrapiPost | null> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    `/posts?filters[slug][$eq]=${slug}&populate[cover]=*&populate[category]=*&populate[tags]=*&populate[author][populate]=avatar&populate[seo][populate]=metaImage`
  );
  return data.data[0] ?? null;
}

export async function getPostsByCategory(categorySlug: string): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    `/posts?filters[category][slug][$eq]=${categorySlug}&populate[cover]=*&populate[category]=*&populate[author][populate]=avatar&sort=publishedAt:desc`
  );
  return data.data;
}

export async function getFeaturedPosts(): Promise<StrapiPost[]> {
  const data = await fetchStrapi<{ data: StrapiPost[] }>(
    "/posts?filters[featured][$eq]=true&populate[cover]=*&populate[category]=*&populate[author][populate]=avatar&sort=publishedAt:desc&pagination[pageSize]=3"
  );
  return data.data;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<StrapiCategory[]> {
  const data = await fetchStrapi<{ data: StrapiCategory[] }>("/categories?sort=name:asc");
  return data.data;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getStrapiImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-blog.jpg";
  if (path.startsWith("http")) return path;
  return `${STRAPI_URL}${path}`;
}

export function calcReadingTime(body: object): number {
  // Strapi Blocks: traverse to extract text, estimate 200wpm
  const text = JSON.stringify(body).replace(/"type":"[^"]+"/g, "").replace(/[^a-zA-Z\s]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(dateString: string, locale = "en-US"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}
```

### 4.2 Create `lib/blog-types.ts`

Shared TypeScript types used across blog components:

```typescript
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: object;
  coverUrl: string;
  coverAlt: string;
  category: { name: string; slug: string; color: string } | null;
  tags: Array<{ name: string; slug: string }>;
  author: {
    name: string;
    bio: string;
    avatarUrl: string;
    twitter: string;
    linkedin: string;
  } | null;
  featured: boolean;
  readingTime: number;
  publishedAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalURL: string | null;
    metaImageUrl: string | null;
  } | null;
}
```

---

## SECTION 5 — NEXT.JS APP ROUTES

Create these files inside `contrivox-repo/app/blog/`.

### 5.1 `app/blog/layout.tsx`

Blog layout wrapping all blog routes. Adds blog-specific nav breadcrumb and sidebar.

```typescript
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/strapi";

export const metadata: Metadata = {
  title: { template: "%s — Contrivox Blog", default: "Contrivox Blog" },
  description: "Plain-English guides to employment contracts, NDAs, apartment leases, and freelance agreements.",
};

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const categories = await getAllCategories();
  return (
    <div style={{ minHeight: "100vh", background: "#07070f" }}>
      {/* Blog nav bar — same dark Contrivox style */}
      <nav style={{
        backdropFilter: "blur(16px)", background: "rgba(7,7,15,0.9)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)", padding: "0 20px",
        position: "sticky", top: 0, zIndex: 90,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📋</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white" }}>Contrivox</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/blog" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Blog</a>
            {categories.slice(0, 4).map(c => (
              <a key={c.id} href={`/blog/category/${c.attributes.slug}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                {c.attributes.name}
              </a>
            ))}
            <a href="/#upload-sec" style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", borderRadius: 8, textDecoration: "none" }}>
              Check My Contract
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
```

### 5.2 `app/blog/page.tsx` — blog index

```typescript
import { getAllPosts, getFeaturedPosts, getAllCategories, getStrapiImageUrl, formatDate, calcReadingTime } from "@/lib/strapi";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contract Guides & Resources",
  description: "Plain-English guides to understanding employment contracts, NDAs, apartment leases, non-competes, and freelance agreements.",
  openGraph: { title: "Contrivox Blog — Contract Guides", description: "Read it before you sign it." },
};

export default async function BlogIndex() {
  const [posts, featured, categories] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts(),
    getAllCategories(),
  ]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 18, padding: "4px 13px", background: "rgba(239,68,68,0.1)", borderRadius: 20, border: "0.5px solid rgba(239,68,68,0.2)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }}></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171", letterSpacing: "0.09em", textTransform: "uppercase" as const }}>Contract guides</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(30px,5vw,48px)", color: "white", lineHeight: 1.1, marginBottom: 14 }}>
          Read it before<br />you sign it.
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 540, lineHeight: 1.7 }}>
          Plain-English guides to employment contracts, NDAs, apartment leases, non-competes, and freelance agreements — written for real people, not lawyers.
        </p>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 40 }}>
        <a href="/blog" style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "white", borderRadius: 20, textDecoration: "none" }}>All</a>
        {categories.map(cat => (
          <a key={cat.id} href={`/blog/category/${cat.attributes.slug}`} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", borderRadius: 20, textDecoration: "none", borderLeft: `3px solid ${cat.attributes.color}` }}>
            {cat.attributes.name}
          </a>
        ))}
      </div>

      {/* Featured posts */}
      {featured.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "white", marginBottom: 20 }}>Featured</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {featured.map(post => (
              <PostCard key={post.id} post={post} featured />
            ))}
          </div>
        </section>
      )}

      {/* All posts */}
      <section>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "white", marginBottom: 20 }}>All articles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      {/* Email CTA */}
      <BlogCTA style={{ marginTop: 64 }} />
    </main>
  );
}

function PostCard({ post, featured = false }: { post: any; featured?: boolean }) {
  const attr = post.attributes;
  const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
  const catColor = attr.category?.data?.attributes?.color ?? "#7c3aed";
  const readTime = calcReadingTime(attr.body);

  return (
    <a href={`/blog/${attr.slug}`} style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
      {attr.cover?.data && (
        <img src={coverUrl} alt={attr.cover.data.attributes.alternativeText || attr.title} style={{ width: "100%", height: 180, objectFit: "cover" as const }} />
      )}
      <div style={{ padding: "16px 18px 18px" }}>
        {attr.category?.data && (
          <span style={{ fontSize: 10, fontWeight: 700, color: catColor, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{attr.category.data.attributes.name}</span>
        )}
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: featured ? 20 : 17, color: "white", margin: "8px 0 10px", lineHeight: 1.25 }}>{attr.title}</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 14 }}>{attr.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          <span>{formatDate(attr.publishedAt)}</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </a>
  );
}
```

### 5.3 `app/blog/[slug]/page.tsx` — individual post

```typescript
import { getAllPosts, getPostBySlug, getStrapiImageUrl, formatDate, calcReadingTime } from "@/lib/strapi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.attributes.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  const attr = post.attributes;
  const seo = attr.seo;
  const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);

  return {
    title: seo?.metaTitle || attr.title,
    description: seo?.metaDescription || attr.excerpt,
    alternates: { canonical: seo?.canonicalURL || `https://contrivox.com/blog/${attr.slug}` },
    openGraph: {
      title: seo?.metaTitle || attr.title,
      description: seo?.metaDescription || attr.excerpt,
      url: `https://contrivox.com/blog/${attr.slug}`,
      type: "article",
      publishedTime: attr.publishedAt,
      images: [{ url: seo?.metaImage?.data?.attributes?.url || coverUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.metaTitle || attr.title,
      description: seo?.metaDescription || attr.excerpt,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const attr = post.attributes;
  const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
  const readTime = calcReadingTime(attr.body);
  const author = attr.author?.data?.attributes;
  const category = attr.category?.data?.attributes;

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: attr.title,
    description: attr.excerpt,
    image: coverUrl,
    author: author ? { "@type": "Person", name: author.name } : undefined,
    publisher: { "@type": "Organization", name: "Contrivox", logo: { "@type": "ImageObject", url: "https://contrivox.com/logo.png" } },
    datePublished: attr.publishedAt,
    dateModified: attr.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://contrivox.com/blog/${attr.slug}` },
  };

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Blog</a>
        {category && <><span style={{ margin: "0 6px" }}>›</span><a href={`/blog/category/${category.slug}`} style={{ color: category.color, textDecoration: "none" }}>{category.name}</a></>}
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{attr.title}</span>
      </nav>

      {/* Header */}
      {category && <span style={{ fontSize: 11, fontWeight: 700, color: category.color, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{category.name}</span>}
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", lineHeight: 1.1, margin: "12px 0 18px" }}>{attr.title}</h1>
      <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>{attr.excerpt}</p>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        {author && <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{author.name}</span>}
        <span>{formatDate(attr.publishedAt)}</span>
        <span>·</span>
        <span>{readTime} min read</span>
      </div>

      {/* Cover */}
      {attr.cover?.data && (
        <img src={coverUrl} alt={attr.cover.data.attributes.alternativeText || attr.title} style={{ width: "100%", borderRadius: 12, marginBottom: 40, maxHeight: 400, objectFit: "cover" as const }} />
      )}

      {/* Body — Strapi Blocks renderer */}
      <div style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.78)" }} className="blog-body">
        <BlocksRenderer content={attr.body as any} />
      </div>

      {/* Tags */}
      {attr.tags?.data?.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 40 }}>
          {attr.tags.data.map((tag: any) => (
            <span key={tag.id} style={{ padding: "4px 12px", fontSize: 12, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", borderRadius: 20 }}>#{tag.attributes.name}</span>
          ))}
        </div>
      )}

      {/* Author card */}
      {author && (
        <div style={{ marginTop: 48, padding: "20px 22px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", gap: 16, alignItems: "flex-start" }}>
          {author.avatar?.data && <img src={getStrapiImageUrl(author.avatar.data.attributes.url)} alt={author.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" as const, flexShrink: 0 }}/>}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: "0 0 5px" }}>{author.name}</p>
            {author.bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{author.bio}</p>}
          </div>
        </div>
      )}

      {/* Mid-article CTA */}
      <BlogCTA style={{ marginTop: 56 }} />
    </article>
  );
}
```

### 5.4 `app/blog/category/[slug]/page.tsx`

```typescript
import { getPostsByCategory, getAllCategories, getStrapiImageUrl, formatDate, calcReadingTime } from "@/lib/strapi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const cats = await getAllCategories();
  return cats.map(c => ({ slug: c.attributes.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cats = await getAllCategories();
  const cat = cats.find(c => c.attributes.slug === params.slug);
  if (!cat) return {};
  return {
    title: `${cat.attributes.name} — Contrivox Blog`,
    description: cat.attributes.description || `Guides about ${cat.attributes.name.toLowerCase()}.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [posts, cats] = await Promise.all([
    getPostsByCategory(params.slug),
    getAllCategories(),
  ]);
  const cat = cats.find(c => c.attributes.slug === params.slug);
  if (!cat) notFound();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
      <a href="/blog" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← All articles</a>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", marginBottom: 10 }}>{cat.attributes.name}</h1>
      {cat.attributes.description && <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>{cat.attributes.description}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {posts.map(post => {
          const attr = post.attributes;
          const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
          return (
            <a key={post.id} href={`/blog/${attr.slug}`} style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
              {attr.cover?.data && <img src={coverUrl} alt={attr.title} style={{ width: "100%", height: 170, objectFit: "cover" as const }}/>}
              <div style={{ padding: "16px 18px 18px" }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white", margin: "0 0 10px", lineHeight: 1.25 }}>{attr.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.6 }}>{attr.excerpt}</p>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(attr.publishedAt)} · {calcReadingTime(attr.body)} min</span>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
```

---

## SECTION 6 — COMPONENTS

### 6.1 Create `components/blog/BlogCTA.tsx`

Inline email capture CTA shown in blog index, mid-post, and post footer.
Submits to the existing `/api/send-report` flow or a dedicated subscriber endpoint.

```typescript
"use client";
import { useState } from "react";

export function BlogCTA({ style }: { style?: React.CSSProperties }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const submit = async () => {
    if (!email) return;
    setStatus("sent"); // optimistic
    // In production: POST to /api/subscribe { email }
    // Store in Supabase email_subscribers table → trigger welcome email via Resend
  };

  return (
    <div style={{ background: "rgba(99,102,241,0.07)", border: "0.5px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "28px 24px", ...style }}>
      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "white", margin: "0 0 8px", lineHeight: 1.2 }}>
        Get our free contract checklist.
      </p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", lineHeight: 1.65 }}>
        The 12 clauses to check before signing any US contract — employment, lease, or freelance. Free, no spam.
      </p>
      {status === "sent" ? (
        <p style={{ fontSize: 14, color: "#4ade80" }}>✓ Check your inbox!</p>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ flex: 1, minWidth: 220, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 9, padding: "11px 14px", color: "white", fontSize: 14, outline: "none" }}
          />
          <button
            onClick={submit}
            style={{ padding: "11px 22px", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", border: "none", borderRadius: 9, cursor: "pointer" }}
          >
            Send me the checklist
          </button>
        </div>
      )}
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 10 }}>No spam. Unsubscribe any time.</p>
    </div>
  );
}
```

### 6.2 Create `components/blog/BlogStyles.css`

Body content styles for Strapi Blocks renderer output.
Import in `app/blog/[slug]/page.tsx` or `app/blog/layout.tsx`.

```css
.blog-body h1,
.blog-body h2,
.blog-body h3,
.blog-body h4 {
  font-family: 'Fraunces', serif;
  color: white;
  line-height: 1.2;
  margin: 2rem 0 1rem;
}
.blog-body h2 { font-size: clamp(22px, 3vw, 30px); }
.blog-body h3 { font-size: clamp(18px, 2.5vw, 24px); }

.blog-body p {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255,255,255,0.75);
  margin-bottom: 1.2rem;
}

.blog-body a {
  color: #a5b4fc;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.blog-body ul,
.blog-body ol {
  padding-left: 1.5rem;
  margin-bottom: 1.2rem;
  color: rgba(255,255,255,0.72);
  line-height: 1.8;
}

.blog-body li { margin-bottom: 0.5rem; }

.blog-body blockquote {
  border-left: 3px solid #7c3aed;
  padding: 12px 20px;
  background: rgba(124,58,237,0.07);
  border-radius: 0 8px 8px 0;
  margin: 1.5rem 0;
  font-size: 17px;
  color: rgba(255,255,255,0.7);
  font-style: italic;
}

.blog-body code {
  background: rgba(255,255,255,0.07);
  border: 0.5px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 14px;
  font-family: var(--font-mono);
  color: #a5b4fc;
}

.blog-body pre {
  background: rgba(255,255,255,0.05);
  border: 0.5px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 18px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.blog-body pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
}

.blog-body img {
  width: 100%;
  border-radius: 10px;
  margin: 1.5rem 0;
}

.blog-body strong { color: white; font-weight: 500; }
.blog-body em { color: rgba(255,255,255,0.65); }

.blog-body hr {
  border: none;
  border-top: 0.5px solid rgba(255,255,255,0.1);
  margin: 2.5rem 0;
}
```

---

## SECTION 7 — API ROUTES

### 7.1 Create `app/api/revalidate/route.ts`

Receives Strapi webhook on publish → clears ISR cache for affected paths.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");

  if (secret !== process.env.NEXT_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const model = body?.model as string | undefined;
  const slug  = body?.entry?.slug as string | undefined;

  // Always revalidate the blog index
  revalidatePath("/blog");

  // Revalidate the specific post if we have a slug
  if (model === "post" && slug) {
    revalidatePath(`/blog/${slug}`);
  }

  // Revalidate category pages
  if (model === "category") {
    revalidatePath("/blog/category/[slug]", "page");
  }

  // Revalidate sitemap
  revalidatePath("/sitemap.xml");

  console.log(`[revalidate] ✓ model=${model} slug=${slug}`);
  return NextResponse.json({ revalidated: true, model, slug });
}
```

### 7.2 Create `app/api/subscribe/route.ts`

Handles blog CTA email subscriptions. Stores to Supabase, sends welcome email via Resend.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { createHash } from "crypto";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY!);

const schema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(100).default("blog-cta"),
});

export async function POST(req: NextRequest) {
  let input: z.infer<typeof schema>;
  try { input = schema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "Invalid email" }, { status: 422 }); }

  const emailHash = createHash("sha256").update(input.email.toLowerCase()).digest("hex");
  const supabase  = createSupabaseServiceClient();

  // Idempotent — upsert on email_hash
  await supabase.from("blog_subscribers").upsert({
    email_hash:       emailHash,
    acquisition_source: input.source,
  }, { onConflict: "email_hash" });

  // Send welcome email
  await resend.emails.send({
    from:    `Contrivox <blog@contrivox.com>`,
    to:      input.email,
    subject: "Your free contract checklist",
    html:    buildWelcomeEmail(),
  });

  return NextResponse.json({ ok: true });
}

function buildWelcomeEmail(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f8;margin:0;padding:32px 16px;">
<table width="600" style="max-width:600px;width:100%;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#09090f;padding:24px 28px;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Contrivox</span>
    <p style="color:#a78bfa;font-size:13px;margin:4px 0 0;">Your contract. Decoded.</p>
  </td></tr>
  <tr><td style="padding:28px;">
    <h2 style="font-size:20px;margin:0 0 16px;">Your 12-clause contract checklist</h2>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">Before you sign any US contract, run through this list. These are the 12 clauses that cause the most problems — and the ones lawyers check first.</p>
    <ol style="font-size:14px;color:#4b5563;line-height:2;padding-left:1.5rem;">
      <li>Non-compete clause (scope, duration, geography)</li>
      <li>Arbitration clause (waives your right to sue)</li>
      <li>Intellectual property assignment (who owns your work)</li>
      <li>At-will employment (can you be fired without cause)</li>
      <li>Auto-renewal clause (hidden re-enrollment)</li>
      <li>Limitation of liability cap</li>
      <li>Indemnification clause (who pays if things go wrong)</li>
      <li>Governing law and jurisdiction</li>
      <li>Notice period and termination conditions</li>
      <li>Non-solicitation (employees and clients)</li>
      <li>Exclusivity clause (can you work with others)</li>
      <li>Liquidated damages (penalty clauses)</li>
    </ol>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:16px 0 24px;">Found something concerning? Upload your contract to Contrivox and get a full plain-English analysis in 30 seconds.</p>
    <a href="https://contrivox.com/#upload-sec" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:700;">Check My Contract →</a>
  </td></tr>
  <tr><td style="padding:16px 28px;background:#f9fafb;font-size:10px;color:#9ca3af;">⚠️ Not legal advice. Educational purposes only.</td></tr>
</table>
</body></html>`;
}
```

---

## SECTION 8 — SEO FILES

### 8.1 Update `app/sitemap.ts`

Replace the static sitemap with one that pulls live slugs from Strapi:

```typescript
import { MetadataRoute } from "next";
import { getAllPosts, getAllCategories } from "@/lib/strapi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([getAllPosts(), getAllCategories()]);
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
    { url: base,         lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...postUrls,
    ...catUrls,
  ];
}
```

### 8.2 Create `app/blog/rss.xml/route.ts`

Auto-generated RSS feed from Strapi posts:

```typescript
import { getAllPosts, getStrapiImageUrl } from "@/lib/strapi";

export const revalidate = 3600; // 1 hour

export async function GET() {
  const posts = await getAllPosts();
  const base  = "https://contrivox.com";

  const items = posts.slice(0, 20).map(post => {
    const attr = post.attributes;
    const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
    return `
    <item>
      <title><![CDATA[${attr.title}]]></title>
      <link>${base}/blog/${attr.slug}</link>
      <guid>${base}/blog/${attr.slug}</guid>
      <pubDate>${new Date(attr.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${attr.excerpt}]]></description>
      ${coverUrl ? `<enclosure url="${coverUrl}" type="image/jpeg"/>` : ""}
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Contrivox Blog</title>
    <link>${base}/blog</link>
    <description>Plain-English guides to US contracts — employment, leases, NDAs, and freelance agreements.</description>
    <language>en-us</language>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
```

---

## SECTION 9 — DATABASE MIGRATION

Create `supabase/migrations/20250518000000_blog_subscribers.sql`:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash          text        NOT NULL UNIQUE,
  acquisition_source  text        NOT NULL DEFAULT 'blog-cta',
  subscribed_at       timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_subscribed_at
  ON public.blog_subscribers(subscribed_at DESC);

ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to blog_subscribers"
  ON public.blog_subscribers
  USING (auth.jwt() ->> 'role' = 'service_role');

COMMIT;
```

Run it:
```bash
supabase db push
```

---

## SECTION 10 — PACKAGE ADDITIONS

In `contrivox-repo/package.json`, add to dependencies:

```json
"@strapi/blocks-react-renderer": "^1.3.0"
```

Install:
```bash
pnpm install
```

---

## SECTION 11 — ENV ADDITIONS

### `contrivox-repo/.env.local` — add:
```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
NEXT_REVALIDATE_SECRET=your-32-char-secret-here
```

### `contrivox-cms/.env` — verify exists with all secrets filled.

---

## SECTION 12 — PRODUCTION DEPLOYMENT

### Strapi production (Railway recommended)

```bash
# Deploy Strapi to Railway
railway login
cd contrivox-cms
railway init
railway up

# Add env vars in Railway dashboard:
# DATABASE_CLIENT=postgres (Railway provides Postgres)
# DATABASE_URL=<railway-postgres-url>
# All other secrets from .env
```

After deploying Strapi to Railway:
1. Copy the production URL (e.g. `https://contrivox-cms.railway.app`)
2. Update Vercel env var: `STRAPI_URL=https://contrivox-cms.railway.app`
3. Update Strapi webhook URL to `https://contrivox.com/api/revalidate`
4. Update `NEXT_PUBLIC_URL` in Strapi env to `https://contrivox.com`

### Strapi media in production

In `contrivox-cms/config/plugins.ts`, add Cloudinary for media storage:

```bash
cd contrivox-cms
npm install @strapi/provider-upload-cloudinary
```

```typescript
// config/plugins.ts — add:
upload: {
  config: {
    provider: "cloudinary",
    providerOptions: {
      cloud_name: env("CLOUDINARY_NAME"),
      api_key: env("CLOUDINARY_KEY"),
      api_secret: env("CLOUDINARY_SECRET"),
    },
    actionOptions: {
      upload: {},
      delete: {},
    },
  },
},
```

Add to Railway env vars: `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` (free Cloudinary account).

---

## SECTION 13 — CONTENT WORKFLOW

Once everything is running, the editorial workflow for publishing a post is:

1. Go to `http://localhost:1337/admin` (dev) or your Railway URL (prod)
2. Content Manager → Posts → Create new entry
3. Fill: title, excerpt, body (rich text), cover image, category, tags, author
4. SEO tab: meta title, meta description (critical for Google)
5. Click Save (draft) → review at `/blog/preview` if you add preview mode
6. Click Publish → Strapi fires webhook → Next.js revalidates in seconds

The blog post appears at `contrivox.com/blog/[slug]` within 60 seconds of publishing.

---

## VERIFICATION CHECKLIST

After completing all sections, verify:

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm build` succeeds
- [ ] `/blog` renders post cards from Strapi
- [ ] `/blog/[slug]` renders individual post with correct metadata
- [ ] `/blog/category/[slug]` renders filtered posts
- [ ] `/sitemap.xml` includes all blog post URLs
- [ ] `/blog/rss.xml` returns valid RSS
- [ ] `/api/revalidate` returns 401 without secret, 200 with correct secret
- [ ] Publishing a post in Strapi triggers revalidation within 60s
- [ ] OG tags visible when sharing a post URL
- [ ] JSON-LD schema present in page source for each post
- [ ] BlogCTA email form submits and sends welcome email
- [ ] Blog nav links render without layout shift on mobile
