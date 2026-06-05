/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-Origin policies — prevent Spectre-class attacks and data leakage
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // unsafe-inline required by Next.js 14 App Router hydration scripts.
      // unsafe-eval removed — nothing in this app needs it.
      // All third-party scripts (jsPDF, PostHog) are bundled via npm — no CDN needed.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      // unsafe-inline required for inline <style> blocks used by the UI component.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      // Browser never talks to Anthropic — Claude calls are server-side only.
      // Stripe connect-src is needed for risk signals on their hosted checkout page.
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://us.i.posthog.com https://eu.i.posthog.com https://app.posthog.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "worker-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Force www → non-www (adjust to your preference)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.contrivox.com" }],
        destination: "https://contrivox.com/:path*",
        permanent: true,
      },
      // favicon.ico fallback for browsers that request it directly
      {
        source: "/favicon.ico",
        destination: "/favicon.png",
        permanent: false,
      },
      // SEO keyword landing routes
      {
        source: "/non-compete-checker",
        destination: "/#upload-sec",
        permanent: false,
      },
      {
        source: "/nda-review",
        destination: "/#upload-sec",
        permanent: false,
      },
      {
        source: "/lease-analyser",
        destination: "/#upload-sec",
        permanent: false,
      },
    ];
  },

  // Disable powered-by header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "contrivox.com" },
    ],
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
});
