import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://contrivox.com",                                          lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: "https://contrivox.com/blog/non-compete-clauses-explained",       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://contrivox.com/blog/nda-red-flags",                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://contrivox.com/blog/lease-clauses-to-watch",              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://contrivox.com/blog/arbitration-clause-meaning",          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
