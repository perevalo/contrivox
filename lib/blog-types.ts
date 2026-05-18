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
