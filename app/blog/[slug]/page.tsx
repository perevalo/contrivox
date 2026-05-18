import { getAllPosts, getPostBySlug, getStrapiImageUrl, formatDate, calcReadingTime } from "@/lib/strapi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import "@/components/blog/BlogStyles.css";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts().catch(() => []);
  return posts.map(p => ({ slug: p.attributes.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  const attr = post.attributes;
  const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);

  return {
    title: attr.seo?.metaTitle || attr.title,
    description: attr.seo?.metaDescription || attr.excerpt,
    alternates: { canonical: attr.seo?.canonicalURL || `https://contrivox.com/blog/${attr.slug}` },
    openGraph: {
      title: attr.seo?.metaTitle || attr.title,
      description: attr.seo?.metaDescription || attr.excerpt,
      url: `https://contrivox.com/blog/${attr.slug}`,
      type: "article",
      publishedTime: attr.publishedAt,
      images: [{ url: attr.seo?.metaImage?.data?.attributes?.url || coverUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: attr.seo?.metaTitle || attr.title,
      description: attr.seo?.metaDescription || attr.excerpt,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: attr.title,
    description: attr.excerpt,
    image: coverUrl,
    author: author ? { "@type": "Person", name: author.name } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Contrivox",
      logo: { "@type": "ImageObject", url: "https://contrivox.com/logo.png" },
    },
    datePublished: attr.publishedAt,
    dateModified: attr.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://contrivox.com/blog/${attr.slug}` },
  };

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Blog</a>
        {category && (
          <>
            <span style={{ margin: "0 6px" }}>›</span>
            <a href={`/blog/category/${category.slug}`} style={{ color: category.color, textDecoration: "none" }}>{category.name}</a>
          </>
        )}
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{attr.title}</span>
      </nav>

      {/* Header */}
      {category && <span style={{ fontSize: 11, fontWeight: 700, color: category.color, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{category.name}</span>}
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", lineHeight: 1.1, margin: "12px 0 18px" }}>{attr.title}</h1>
      <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>{attr.excerpt}</p>

      {/* Meta */}
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

      {/* Body */}
      <div className="blog-body">
        <BlocksRenderer content={attr.body as Parameters<typeof BlocksRenderer>[0]["content"]} />
      </div>

      {/* Tags */}
      {attr.tags?.data?.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 40 }}>
          {attr.tags.data.map(tag => (
            <span key={tag.id} style={{ padding: "4px 12px", fontSize: 12, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", borderRadius: 20 }}>#{tag.attributes.name}</span>
          ))}
        </div>
      )}

      {/* Author card */}
      {author && (
        <div style={{ marginTop: 48, padding: "20px 22px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", gap: 16, alignItems: "flex-start" }}>
          {author.avatar?.data && (
            <img src={getStrapiImageUrl(author.avatar.data.attributes.url)} alt={author.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" as const, flexShrink: 0 }} />
          )}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: "0 0 5px" }}>{author.name}</p>
            {author.bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{author.bio}</p>}
          </div>
        </div>
      )}

      <BlogCTA style={{ marginTop: 56 }} />
    </article>
  );
}
