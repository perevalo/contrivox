import { getAllPosts, getFeaturedPosts, getAllCategories, getStrapiImageUrl, formatDate, calcReadingTime, type StrapiPost } from "@/lib/strapi";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contract Guides & Resources — Contrivox Blog",
  description: "Plain-English guides to understanding employment contracts, NDAs, apartment leases, non-competes, and freelance agreements.",
  alternates: { canonical: "https://contrivox.com/blog" },
  openGraph: {
    title: "Contrivox Blog — Contract Guides",
    description: "Read it before you sign it.",
    url: "https://contrivox.com/blog",
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrivox Blog — Contract Guides",
    description: "Read it before you sign it.",
  },
};

export default async function BlogIndex() {
  const [posts, featured, categories] = await Promise.all([
    getAllPosts().catch(() => []),
    getFeaturedPosts().catch(() => []),
    getAllCategories().catch(() => []),
  ]);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://contrivox.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://contrivox.com/blog" },
    ],
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
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
        {posts.length === 0 ? (
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>No articles published yet — check back soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </section>

      <BlogCTA style={{ marginTop: 64 }} />
    </main>
  );
}

function PostCard({ post, featured = false }: { post: StrapiPost; featured?: boolean }) {
  const attr = post.attributes;
  const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
  const catColor = attr.category?.data?.attributes?.color ?? "#7c3aed";
  const readTime = calcReadingTime(attr.body);

  return (
    <a href={`/blog/${attr.slug}`} style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
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
