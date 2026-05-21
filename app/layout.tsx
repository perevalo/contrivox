import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

const SITE = "https://contrivox.com";

export const metadata: Metadata = {
  title: "Contrivox — Read Your Contract Before It Reads You",
  description:
    "Upload any US contract — employment, NDA, lease, freelance — and get a plain-English analysis, red flags, fairness score, and negotiation scripts in 30 seconds.",
  keywords: [
    "contract analysis", "non-compete checker", "NDA review", "lease analyser",
    "employment contract red flags", "contract review AI", "is my non-compete enforceable",
    "freelance contract review", "arbitration clause explained",
  ],
  authors: [{ name: "Contrivox" }],
  alternates: { canonical: SITE },
  openGraph: {
    title: "Contrivox — Read Your Contract Before It Reads You",
    description: "Non-competes. Arbitration clauses. Auto-renewals. We catch what you miss.",
    url: SITE,
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrivox — Read Your Contract Before It Reads You",
    description: "Non-competes. Arbitration clauses. Auto-renewals. We catch what you miss.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Contrivox",
  url: SITE,
  description: "AI-powered contract analysis. Upload any US contract and get instant red-flag detection, a fairness score, and negotiation scripts.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Contrivox",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE,
  description: "AI-powered contract analysis. Upload employment contracts, NDAs, leases, and freelance agreements for instant red-flag detection and plain-English negotiation scripts.",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Quick Scan" },
    { "@type": "Offer", price: "9.00", priceCurrency: "USD", name: "Full Report (1 credit)" },
    { "@type": "Offer", price: "19.00", priceCurrency: "USD", name: "Pro (3 credits)" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
