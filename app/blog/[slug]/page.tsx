import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";
import "@/components/blog/BlogStyles.css";

export const revalidate = false;

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    alternates: { canonical: post.seo.canonicalURL },
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      url: post.seo.canonicalURL,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    publisher: {
      "@type": "Organization",
      name: "Contrivox",
      logo: { "@type": "ImageObject", url: "https://contrivox.com/logo.png" },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.seo.canonicalURL },
  };

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Blog</a>
        {post.category && (
          <>
            <span style={{ margin: "0 6px" }}>›</span>
            <a href={`/blog/category/${post.category.slug}`} style={{ color: post.category.color, textDecoration: "none" }}>
              {post.category.name}
            </a>
          </>
        )}
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "rgba(255,255,255,0.6)" }}>{post.title}</span>
      </nav>

      {/* Header */}
      {post.category && (
        <span style={{ fontSize: 11, fontWeight: 700, color: post.category.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {post.category.name}
        </span>
      )}
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", lineHeight: 1.1, margin: "12px 0 18px" }}>
        {post.title}
      </h1>
      <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>
        {post.excerpt}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, paddingBottom: 24, borderBottom: "0.5px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Contrivox</span>
        <span>{formatDate(post.publishedAt)}</span>
        <span>·</span>
        <span>{post.readingTime} min read</span>
      </div>

      {/* Body — rendered from markdown */}
      <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

      <BlogCTA style={{ marginTop: 56 }} />
    </article>
  );
}
