import { getAllPosts, getStrapiImageUrl } from "@/lib/strapi";

export const revalidate = 3600;

export async function GET() {
  const posts = await getAllPosts().catch(() => []);
  const base  = "https://contrivox.com";

  const items = posts.slice(0, 20).map(post => {
    const attr = post.attributes;
    const coverUrl = getStrapiImageUrl(attr.cover?.data?.attributes?.url);
    const hasCover = !!attr.cover?.data;
    return `
    <item>
      <title><![CDATA[${attr.title}]]></title>
      <link>${base}/blog/${attr.slug}</link>
      <guid>${base}/blog/${attr.slug}</guid>
      <pubDate>${new Date(attr.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${attr.excerpt}]]></description>
      ${hasCover ? `<enclosure url="${coverUrl}" type="image/jpeg"/>` : ""}
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
