"use client";
import { useState } from "react";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function BlogCTA({ style }: { style?: React.CSSProperties }) {
  const [email, setEmail]         = useState("");
  const [validErr, setValidErr]   = useState(false);
  const [status, setStatus]       = useState<"idle" | "loading" | "sent" | "error">("idle");

  const submit = async () => {
    if (status === "loading") return;
    if (!isValidEmail(email)) { setValidErr(true); return; }
    setValidErr(false);
    setStatus("loading");
    try {
      const res = await fetch("/api/checklist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ background: "rgba(99,102,241,0.07)", border: "0.5px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "28px 24px", ...style }}>
      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "white", margin: "0 0 8px", lineHeight: 1.2 }}>
        The 12 clauses that cost people thousands.
      </p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", lineHeight: 1.65 }}>
        Free checklist — delivered instantly. No spam, ever. Used by thousands of professionals before signing.
      </p>

      {status === "sent" ? (
        <p style={{ fontSize: 14, color: "#4ade80", margin: 0 }}>
          ✓ Checklist sent! Check your inbox (and spam folder just in case).
        </p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setValidErr(false); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{
                flex: 1, minWidth: 220,
                background: "rgba(255,255,255,0.06)",
                border: `0.5px solid ${validErr ? "#f87171" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 9, padding: "11px 14px",
                color: "white", fontSize: 14, outline: "none",
              }}
            />
            <button
              onClick={submit}
              disabled={status === "loading"}
              style={{
                padding: "11px 22px", fontSize: 13, fontWeight: 700,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "white", border: "none", borderRadius: 9,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                whiteSpace: "nowrap" as const,
              }}
            >
              {status === "loading" ? "Sending…" : "Send me the checklist"}
            </button>
          </div>
          {validErr && (
            <p style={{ fontSize: 12, color: "#f87171", marginTop: 8, marginBottom: 0 }}>
              Please enter a valid email address.
            </p>
          )}
          {status === "error" && (
            <p style={{ fontSize: 12, color: "#f87171", marginTop: 8, marginBottom: 0 }}>
              Something went wrong. Try again or email us at{" "}
              <a href="mailto:contact@contrivox.com" style={{ color: "#f87171" }}>contact@contrivox.com</a>
            </p>
          )}
        </>
      )}
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 10, marginBottom: 0 }}>
        No spam. Unsubscribe any time.
      </p>
    </div>
  );
}
