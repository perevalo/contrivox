import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

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
  openGraph: {
    title: "Contrivox — Read Your Contract Before It Reads You",
    description: "Non-competes. Arbitration clauses. Auto-renewals. We catch what you miss.",
    url: "https://contrivox.com",
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrivox — Read Your Contract Before It Reads You",
    description: "Non-competes. Arbitration clauses. Auto-renewals. We catch what you miss.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://contrivox.com"),
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
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
