import type { Metadata } from "next";
import { getAllCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: { template: "%s — Contrivox Blog", default: "Contrivox Blog" },
  description: "Plain-English guides to employment contracts, NDAs, apartment leases, and freelance agreements.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const categories = getAllCategories();
  return (
    <div style={{ minHeight: "100vh", background: "var(--cvx-bg)" }}>
      <nav style={{
        backdropFilter: "blur(16px)", background: "var(--cvx-nav)",
        borderBottom: "0.5px solid var(--cvx-border)", padding: "0 20px",
        position: "sticky", top: 0, zIndex: 90,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📋</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "var(--cvx-heading)" }}>Contrivox</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
            <a href="/blog" style={{ fontSize: 13, color: "var(--cvx-muted)", textDecoration: "none" }}>Blog</a>
            {categories.slice(0, 4).map(c => (
              <a key={c.slug} href={`/blog/category/${c.slug}`} style={{ fontSize: 12, color: "var(--cvx-faint)", textDecoration: "none" }}>
                {c.name}
              </a>
            ))}
            <a href="/#upload-sec" style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", borderRadius: 8, textDecoration: "none" }}>
              Check My Contract
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
