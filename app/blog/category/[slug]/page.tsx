import { getPostsByCategory, getAllCategories, formatDate } from "@/lib/blog";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

export function generateStaticParams() {
  return getAllCategories().map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = getAllCategories().find(c => c.slug === params.slug);
  if (!cat) return {};
  const title = `${cat.name} — Contrivox Blog`;
  const description = cat.description || `Plain-English guides about ${cat.name.toLowerCase()} — written for real people, not lawyers.`;
  const url = `https://contrivox.com/blog/category/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Contrivox", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat   = getAllCategories().find(c => c.slug === params.slug);
  const posts = getPostsByCategory(params.slug);
  if (!cat) notFound();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
      <a href="/blog" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← All articles</a>

      <div style={{ marginTop: 16, marginBottom: 36 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: cat.color, marginRight: 8, verticalAlign: "middle" }}></span>
        <h1 style={{ display: "inline", fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white" }}>{cat.name}</h1>
        {cat.description && (
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>{cat.description}</p>
        )}
      </div>

      {posts.length === 0 ? (
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>No articles in this category yet — check back soon.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {posts.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 18px" }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white", margin: "0 0 10px", lineHeight: 1.25 }}>{post.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.6 }}>{post.excerpt}</p>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(post.publishedAt)} · {post.readingTime} min</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
