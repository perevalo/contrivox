import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Contrivox — Your Contract, Decoded",
  description:
    "Upload any contract in any language and get a plain-language analysis, red flags, fairness score and negotiation scripts in seconds.",
  keywords: ["contract analysis", "legal AI", "contract review", "NDA checker", "lease analyser"],
  authors: [{ name: "Contrivox" }],
  openGraph: {
    title: "Contrivox — Your Contract, Decoded",
    description: "Know what you're signing before it costs you everything.",
    url: "https://contrivox.com",
    siteName: "Contrivox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrivox — Your Contract, Decoded",
    description: "Know what you're signing before it costs you everything.",
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
