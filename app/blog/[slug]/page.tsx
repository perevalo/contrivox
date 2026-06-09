import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { InlineCTA } from "@/components/blog/InlineCTA";
import { BlogStickyBanner } from "@/components/blog/BlogStickyBanner";
import "@/components/blog/BlogStyles.css";

export const revalidate = false;

const INLINE_CTA_SLUGS = new Set([
  "non-compete-fired",
  "ftc-non-compete-ban",
  "what-is-an-nda",
  "employment-contract-red-flags",
  "non-compete-enforceable-california",
  "termination-clause-explained",
  "does-non-compete-apply-if-fired",
]);

function splitAfterFirstParagraph(html: string): [string, string] {
  const idx = html.indexOf("</p>");
  if (idx === -1) return [html, ""];
  const cut = idx + 4;
  return [html.slice(0, cut), html.slice(cut)];
}

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: post.seo.canonicalURL },
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      url: post.seo.canonicalURL,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
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

  const showInlineCTA = INLINE_CTA_SLUGS.has(params.slug);
  const [bodyFirst, bodyRest] = showInlineCTA
    ? splitAfterFirstParagraph(post.bodyHtml)
    : [post.bodyHtml, ""];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "Contrivox",
      url: "https://contrivox.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Contrivox",
      logo: { "@type": "ImageObject", url: "https://contrivox.com/logo.png" },
    },
    image: {
      "@type": "ImageObject",
      url: "https://contrivox.com/logo.png",
      width: 148,
      height: 32,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.seo.canonicalURL },
    inLanguage: "en-US",
  };

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "var(--cvx-faint)", marginBottom: 24 }}>
        <a href="/blog" style={{ color: "var(--cvx-faint)", textDecoration: "none" }}>Blog</a>
        {post.category && (
          <>
            <span style={{ margin: "0 6px" }}>›</span>
            <a href={`/blog/category/${post.category.slug}`} style={{ color: post.category.color, textDecoration: "none" }}>
              {post.category.name}
            </a>
          </>
        )}
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "var(--cvx-muted)" }}>{post.title}</span>
      </nav>

      {/* Header */}
      {post.category && (
        <span style={{ fontSize: 11, fontWeight: 700, color: post.category.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {post.category.name}
        </span>
      )}
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "var(--cvx-heading)", lineHeight: 1.1, margin: "12px 0 18px" }}>
        {post.title}
      </h1>
      <p style={{ fontSize: 17, color: "var(--cvx-muted)", lineHeight: 1.7, marginBottom: 24 }}>
        {post.excerpt}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, paddingBottom: 24, borderBottom: "0.5px solid var(--cvx-border)", fontSize: 13, color: "var(--cvx-faint)" }}>
        <span style={{ fontWeight: 600, color: "var(--cvx-text)" }}>{post.author}</span>
        <span>{formatDate(post.publishedAt)}</span>
        <span>·</span>
        <span>{post.readingTime} min read</span>
      </div>

      {/* Body — rendered from markdown */}
      <div className="blog-body" dangerouslySetInnerHTML={{ __html: bodyFirst }} />
      {showInlineCTA && (
        <>
          <InlineCTA slug={params.slug} />
          {bodyRest && <div className="blog-body" dangerouslySetInnerHTML={{ __html: bodyRest }} />}
        </>
      )}

      <BlogCTA style={{ marginTop: 56 }} />
      {showInlineCTA && <BlogStickyBanner />}
    </article>
  );
}
