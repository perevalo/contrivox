import { getAllPosts, getFeaturedPosts, getAllCategories, formatDate, type BlogPost } from "@/lib/blog";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Contract Guides & Resources — Contrivox Blog",
  description: "Free guides to understanding employment contracts, NDAs, leases, non-competes, and freelance agreements — written in plain English by the Contrivox team.",
  alternates: { canonical: "https://contrivox.com/blog" },
  openGraph: {
    title: "Contrivox Blog — Read It Before You Sign It",
    description: "Free plain-English guides to employment contracts, NDAs, leases, non-competes, and freelance agreements.",
    url: "https://contrivox.com/blog",
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrivox Blog — Read It Before You Sign It",
    description: "Free plain-English guides to employment contracts, NDAs, leases, non-competes, and freelance agreements.",
  },
};

export default function BlogIndex() {
  const allPosts   = getAllPosts();
  const featured   = getFeaturedPosts();
  const categories = getAllCategories();
  const featuredSlugs = new Set(featured.map(p => p.slug));
  const posts = allPosts.filter(p => !featuredSlugs.has(p.slug));

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
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(30px,5vw,48px)", color: "var(--cvx-heading)", lineHeight: 1.1, marginBottom: 14 }}>
          Read it before<br />you sign it.
        </h1>
        <p style={{ fontSize: 16, color: "var(--cvx-muted)", maxWidth: 540, lineHeight: 1.7 }}>
          Plain-English guides to employment contracts, NDAs, apartment leases, non-competes, and freelance agreements — written for real people, not lawyers.
        </p>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 40 }}>
        <a href="/blog" style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "var(--cvx-surface)", color: "var(--cvx-heading)", borderRadius: 20, textDecoration: "none", border: "0.5px solid var(--cvx-border)" }}>
          All <span style={{ opacity: 0.5 }}>({allPosts.length})</span>
        </a>
        {categories.map(cat => {
          const count = allPosts.filter(p => p.category?.slug === cat.slug).length;
          return (
            <a key={cat.slug} href={`/blog/category/${cat.slug}`} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, background: "var(--cvx-surface)", color: "var(--cvx-muted)", borderRadius: 20, textDecoration: "none", borderLeft: `3px solid ${cat.color}` }}>
              {cat.name} <span style={{ opacity: 0.5 }}>({count})</span>
            </a>
          );
        })}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--cvx-heading)", marginBottom: 20 }}>Featured</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {featured.map(post => <PostCard key={post.slug} post={post} featured />)}
          </div>
        </section>
      )}

      {/* Conversion CTA */}
      <div style={{ margin: "0 0 48px", padding: "24px 28px", background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.08))", border: "0.5px solid rgba(124,58,237,0.25)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" as const }}>
        <div>
          <p style={{ fontFamily: "'Fraunces',serif", fontSize: 18, color: "var(--cvx-heading)", margin: "0 0 6px", lineHeight: 1.2 }}>Have a contract to review right now?</p>
          <p style={{ fontSize: 13, color: "var(--cvx-muted)", margin: 0 }}>Upload it and get a plain-English report in 60 seconds — from \$9, no subscription.</p>
        </div>
        <a href="/#upload-sec" style={{ flexShrink: 0, padding: "11px 22px", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          Check My Contract →
        </a>
      </div>

      {/* All articles */}
      <section>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--cvx-heading)", marginBottom: 20 }}>All articles</h2>
        {posts.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--cvx-muted)" }}>No articles published yet — check back soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {posts.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        )}
      </section>

      <BlogCTA style={{ marginTop: 64 }} />
    </main>
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <a href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block", background: "var(--cvx-surface)", border: "0.5px solid var(--cvx-border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 18px" }}>
        {post.category && (
          <span style={{ fontSize: 10, fontWeight: 700, color: post.category.color, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
            {post.category.name}
          </span>
        )}
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: featured ? 20 : 17, color: "var(--cvx-heading)", margin: "8px 0 10px", lineHeight: 1.25 }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--cvx-muted)", lineHeight: 1.65, marginBottom: 14 }}>
          {post.excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--cvx-faint)" }}>
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </a>
  );
}
