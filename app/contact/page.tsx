"use client";

import { useState } from "react";
import Link from "next/link";

const SUBJECTS = [
  "General Inquiry",
  "Support",
  "Billing",
  "Privacy / Legal",
  "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "11px 14px",
  fontSize: 14,
  color: "rgba(255,255,255,0.88)",
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: 7,
  fontFamily: "'DM Sans',sans-serif",
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg((data as { error?: string }).error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070f; color: rgba(255,255,255,0.82); font-family: 'DM Sans', sans-serif; }
        a { color: #a78bfa; text-decoration: none; }
        a:hover { text-decoration: underline; }
        input:focus, textarea:focus, select:focus { border-color: rgba(124,58,237,0.6) !important; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07070f" }}>
        {/* Nav */}
        <nav style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)", padding: "0 20px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", height: 56 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h7M3 13h9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, color: "white", fontWeight: 600 }}>Contrivox</span>
            </Link>
          </div>
        </nav>

        <main style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px 80px" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
            Get in touch
          </p>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,44px)", color: "white", marginBottom: 10, lineHeight: 1.1, fontWeight: 600 }}>
            Contact Us
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 40, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
            Have a question, issue, or feedback? Send us a message and we{"'"}ll get back to you.
            You can also email us directly at{" "}
            <a href="mailto:contact@contrivox.com" style={{ color: "#a78bfa" }}>contact@contrivox.com</a>.
          </p>

          {status === "success" ? (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 10 }}>✓</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#4ade80", fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>Message sent!</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
                We{"'"}ll reply to your email within 1–2 business days.
              </p>
              <button
                onClick={() => { setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); setStatus("idle"); }}
                style={{ marginTop: 20, fontSize: 13, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {SUBJECTS.map(s => <option key={s} value={s} style={{ background: "#1a1a2e" }}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe your question or issue..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                />
              </div>

              {status === "error" && (
                <p style={{ fontSize: 13, color: "#f87171", fontFamily: "'DM Sans',sans-serif" }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "13px 28px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif",
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  opacity: status === "sending" ? 0.7 : 1,
                  alignSelf: "flex-start",
                  transition: "opacity .15s",
                }}
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.08)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Terms of Service</Link>
            <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>← Back to Contrivox</Link>
          </div>
        </main>
      </div>
    </>
  );
}
