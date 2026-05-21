import { getPostsByCategory, getAllCategories, getStrapiImageUrl, formatDate, calcReadingTime } from "@/lib/strapi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const cats = await getAllCategories().catch(() => []);
  return cats.map(c => ({ slug: c.attributes.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cats = await getAllCategories();
  const cat = cats.find(c => c.attributes.slug === params.slug);
  if (!cat) return {};
  const title = `${cat.attributes.name} — Contrivox Blog`;
  const description = cat.attributes.description || `Plain-English guides about ${cat.attributes.name.toLowerCase()} — written for real people, not lawyers.`;
  const url = `https://contrivox.com/blog/category/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Contrivox", type: "website" },
    twitter: { card: "summary_large_image", title, description },
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
      <div style={{ marginTop: 16, marginBottom: 36 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: cat.attributes.color, marginRight: 8, verticalAlign: "middle" }}></span>
        <h1 style={{ display: "inline", fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white" }}>{cat.attributes.name}</h1>
        {cat.attributes.description && (
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>{cat.attributes.description}</p>
        )}
      </div>

      {posts.length === 0 ? (
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>No articles in this category yet — check back soon.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {posts.map(post => {
            const attr = post.attributes;
            const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
            return (
              <a key={post.id} href={`/blog/${attr.slug}`} style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
                {attr.cover?.data && (
                  <img src={coverUrl} alt={attr.title} style={{ width: "100%", height: 170, objectFit: "cover" as const }} />
                )}
                <div style={{ padding: "16px 18px 18px" }}>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white", margin: "0 0 10px", lineHeight: 1.25 }}>{attr.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.6 }}>{attr.excerpt}</p>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(attr.publishedAt)} · {calcReadingTime(attr.body)} min</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
