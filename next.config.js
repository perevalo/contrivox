/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.stripe.com https://www.google-analytics.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "script-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://js.stripe.com https://www.googletagmanager.com https://connect.facebook.net",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,

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
    ];
  },

  // Disable powered-by header
  poweredByHeader: false,

  // Image optimisation domains
  images: {
    domains: ["contrivox.com"],
  },
};

module.exports = nextConfig;
