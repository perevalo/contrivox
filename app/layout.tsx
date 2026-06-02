import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const GA_ID = "G-NP37VTZ5KQ";

const SITE = "https://contrivox.com";

export const metadata: Metadata = {
  title: "Contract Review AI — Red Flags, Fairness Score & Negotiation Scripts | Contrivox",
  description:
    "Upload any contract — employment, NDA, lease, or freelance — and get a plain-English analysis, red flags, fairness score, and negotiation scripts in 60 seconds. From $9.",
  keywords: [
    "contract analysis", "non-compete checker", "NDA review", "lease analyser",
    "employment contract red flags", "contract review AI", "is my non-compete enforceable",
    "freelance contract review", "arbitration clause explained",
  ],
  authors: [{ name: "Contrivox" }],
  alternates: { canonical: SITE },
  openGraph: {
    title: "Contract Review AI — Red Flags, Fairness Score & Negotiation Scripts | Contrivox",
    description: "Upload any contract — employment, NDA, lease, or freelance — and get a plain-English analysis, red flags, fairness score, and negotiation scripts in 60 seconds. From $9.",
    url: SITE,
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contract Review AI — Red Flags, Fairness Score & Negotiation Scripts | Contrivox",
    description: "Upload any contract — employment, NDA, lease, or freelance — and get a plain-English analysis, red flags, fairness score, and negotiation scripts in 60 seconds. From $9.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Prevent theme flash: runs synchronously before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('cvx_theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      </head>
      <body>
        <ThemeProvider>
          <PostHogProvider>
            {children}
            <StickyMobileCTA />
          </PostHogProvider>
        </ThemeProvider>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive"/>
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <Analytics />
      </body>
    </html>
  );
}
