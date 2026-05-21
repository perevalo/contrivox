import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Contrivox",
  description: "How Contrivox collects, uses, and protects your personal data.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "May 20, 2026";
const CONTACT_EMAIL = "legal@contrivox.com";
const SUPPORT_EMAIL = "contact@contrivox.com";

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070f; color: rgba(255,255,255,0.82); font-family: 'DM Sans', sans-serif; }
        a { color: #a78bfa; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07070f" }}>
        {/* Nav */}
        <nav style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)", padding: "0 20px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", height: 56 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h7M3 13h9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white", fontWeight: 600 }}>Contrivox</span>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "52px 20px 80px" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", marginBottom: 10, lineHeight: 1.1, fontWeight: 600 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 48, fontFamily: "'DM Sans',sans-serif" }}>
            Last updated: {LAST_UPDATED}
          </p>

          <Section title="1. Who We Are">
            <P>Contrivox ("Contrivox", "we", "us", "our") operates the website contrivox.com and provides an AI-powered contract analysis service. For privacy inquiries, contact us at <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.</P>
          </Section>

          <Section title="2. What Data We Collect and Why">
            <SubSection title="2.1 Contract Documents">
              <P>When you upload a contract for analysis, the document (PDF, image, or text) is transmitted securely to our servers and forwarded to Anthropic's Claude API to generate the analysis. We do not permanently store the raw content of your contract after analysis is complete. Uploaded files in Supabase Storage are automatically deleted within 30 days of upload.</P>
              <P>We never use your contract content to train AI models. Anthropic's API terms prohibit using submitted content for model training without explicit consent.</P>
            </SubSection>

            <SubSection title="2.2 Payment and Email Data">
              <P>When you purchase a full report, Stripe (our payment processor) collects your payment card details and email address. We receive only your email address and the transaction amount — we never see or store your card number, CVV, or bank details. Your email is used solely to deliver your analysis report via Resend (our email delivery provider).</P>
              <P>Stripe is PCI-DSS Level 1 certified. Review <A href="https://stripe.com/privacy">Stripe's Privacy Policy</A> for full details.</P>
            </SubSection>

            <SubSection title="2.3 Technical and Usage Data">
              <P>We collect your IP address in hashed, non-reversible form for rate-limiting purposes only. We cannot identify you from your hashed IP address.</P>
              <P>We use PostHog to collect anonymized analytics — page views, button clicks, analysis completion rates, and similar behavioral signals — to understand how the product is used and improve it. PostHog analytics do not include your contract content, email address, or payment information. You can opt out of PostHog tracking by enabling the "Do Not Track" setting in your browser.</P>
            </SubSection>

            <SubSection title="2.4 Account Data (Registered Users)">
              <P>If you create an account, we store your email address and encrypted password hash (managed by Supabase Auth). We do not store plaintext passwords. You may delete your account at any time by contacting <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.</P>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "To analyse your contract using Claude (Anthropic's AI) and return results to you",
                "To process your payment and deliver your full report by email",
                "To prevent abuse via rate limiting (hashed IP only)",
                "To improve the product through aggregated, anonymized analytics",
                "To respond to legal obligations and support requests",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{item}</li>
              ))}
            </ul>
            <P>We do not sell your personal data to third parties. We do not use your data for targeted advertising.</P>
          </Section>

          <Section title="4. Third-Party Services">
            <P>The following sub-processors handle data on our behalf:</P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
                  {["Service", "Purpose", "Data Shared"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Anthropic", "AI contract analysis", "Contract text/image"],
                  ["Stripe", "Payment processing", "Email, payment details"],
                  ["Supabase", "Database & file storage", "Contract files (temporary), account data"],
                  ["PostHog", "Product analytics", "Anonymized usage events"],
                  ["Resend", "Email delivery", "Your email address, report content"],
                ].map(([svc, purpose, data]) => (
                  <tr key={svc} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                    <td style={tdStyle}>{svc}</td>
                    <td style={tdStyle}>{purpose}</td>
                    <td style={tdStyle}>{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="5. Data Retention">
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Uploaded contract files: deleted within 30 days of upload",
                "Analysis results (JSON): retained for 12 months for support purposes, then deleted",
                "Payment records: retained for 7 years as required by tax law",
                "Hashed IP addresses: purged after 90 days",
                "Account data: retained until you request deletion",
                "Email delivery logs: retained for 90 days",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <P>Depending on your location, you may have the following rights regarding your personal data:</P>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {[
                "Access: request a copy of the personal data we hold about you",
                "Correction: request that inaccurate data be corrected",
                "Deletion: request deletion of your personal data (\"right to be forgotten\")",
                "Portability: receive your data in a machine-readable format",
                "Objection: object to certain processing activities",
                "Opt-out of sale (California / CCPA): we do not sell personal data, so this right is inherently satisfied",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{item}</li>
              ))}
            </ul>
            <P>To exercise any of these rights, email <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. We will respond within 30 days. We may ask you to verify your identity before acting on a request.</P>
          </Section>

          <Section title="7. Cookies">
            <P>Contrivox uses only essential cookies required for authentication (Supabase session) and security (CSRF protection). We do not serve advertising cookies or use fingerprinting. PostHog uses a first-party cookie to distinguish unique visitors; this is analytics-only and contains no personal identifiers.</P>
            <P>To opt out of PostHog analytics, enable "Do Not Track" in your browser settings — PostHog respects this signal.</P>
          </Section>

          <Section title="8. Security">
            <P>We implement industry-standard security measures including:</P>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {[
                "HTTPS with HSTS enforced across all pages",
                "Content Security Policy to mitigate cross-site scripting",
                "Row-level security on all database tables (Supabase RLS)",
                "IP addresses stored only as irreversible SHA-256 hashes",
                "Stripe's PCI-DSS Level 1 infrastructure for all payment data",
                "Server-side-only access to all API keys — none exposed to the browser",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{item}</li>
              ))}
            </ul>
            <P>Despite these measures, no system is 100% secure. If you discover a security vulnerability, please report it responsibly to <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.</P>
          </Section>

          <Section title="9. International Data Transfers">
            <P>Contrivox is operated from the United States. By using our service, you acknowledge that your data may be transferred to and processed in the United States and other countries where our service providers operate. We ensure that such transfers comply with applicable data protection law through the use of Standard Contractual Clauses and other appropriate safeguards where required.</P>
          </Section>

          <Section title="10. Children">
            <P>Contrivox is not directed at persons under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, contact us and we will delete it promptly.</P>
          </Section>

          <Section title="11. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Material changes will be communicated via the website. Your continued use of Contrivox after changes become effective constitutes your acceptance of the revised policy.</P>
          </Section>

          <Section title="12. Contact">
            <P>For any privacy-related questions or to exercise your rights:</P>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 18px", marginTop: 12 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }}>
                Contrivox<br/>
                Legal &amp; privacy: <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A><br/>
                General support: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>
              </p>
            </div>
            <P>You can also reach us via the <A href="/contact">contact form</A>.</P>
          </Section>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.08)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Terms of Service</Link>
            <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>← Back to Contrivox</Link>
          </div>
        </main>
      </div>
    </>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  color: "rgba(255,255,255,0.62)",
  fontFamily: "'DM Sans',sans-serif",
  lineHeight: 1.5,
  verticalAlign: "top",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "white", marginBottom: 14, fontWeight: 600 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.75, fontFamily: "'DM Sans',sans-serif" }}>{children}</p>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: "#a78bfa" }}>{children}</a>;
}
