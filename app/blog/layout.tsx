import type { Metadata } from "next";
import { getAllCategories } from "@/lib/strapi";

export const metadata: Metadata = {
  title: { template: "%s — Contrivox Blog", default: "Contrivox Blog" },
  description: "Plain-English guides to employment contracts, NDAs, apartment leases, and freelance agreements.",
};

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const categories = await getAllCategories().catch(() => []);
  return (
    <div style={{ minHeight: "100vh", background: "#07070f" }}>
      <nav style={{
        backdropFilter: "blur(16px)", background: "rgba(7,7,15,0.9)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)", padding: "0 20px",
        position: "sticky", top: 0, zIndex: 90,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📋</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white" }}>Contrivox</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
            <a href="/blog" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Blog</a>
            {categories.slice(0, 4).map(c => (
              <a key={c.id} href={`/blog/category/${c.attributes.slug}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                {c.attributes.name}
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
