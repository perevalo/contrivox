"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

const MESSAGES = [
  "Scanning every clause…",
  "Checking for non-compete language…",
  "Flagging arbitration clauses…",
  "Reviewing IP assignment terms…",
  "Checking for auto-renewal traps…",
  "Identifying missing protections…",
  "Calculating your fairness score…",
  "Almost done…",
];

const TIMEOUT_MS = 120_000;

export default function SuccessContent() {
  const searchParams   = useSearchParams();
  const stripeSession  = searchParams.get("session_id");
  const [msgIdx, setMsgIdx]   = useState(0);
  const [done, setDone]       = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startRef  = useRef(Date.now());
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stripeSession) return;

    msgRef.current = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 5000);

    const poll = async () => {
      if (Date.now() - startRef.current >= TIMEOUT_MS) {
        clearInterval(pollRef.current!);
        clearInterval(msgRef.current!);
        setTimedOut(true);
        setDone(true);
        return;
      }
      try {
        const res  = await fetch(`/api/contract/status?stripe_session=${stripeSession}`);
        const data = await res.json();
        if (data.status === "done" || data.status === "error") {
          clearInterval(pollRef.current!);
          clearInterval(msgRef.current!);
          setDone(true);
        }
      } catch {
        // network blip — keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (msgRef.current)  clearInterval(msgRef.current);
    };
  }, [stripeSession]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#07070f;font-family:'DM Sans',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 52 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h7M3 13h9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 18, color: "white", fontWeight: 600 }}>Contrivox</span>
        </div>

        {!done ? (
          /* ── Analysing state ── */
          <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
            {/* Spinner ring */}
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 32px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#7c3aed" strokeWidth="6"
                  strokeDasharray="60 204" strokeLinecap="round"
                  style={{ animation: "spin 1.4s linear infinite", transformOrigin: "center" }}
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📋</div>
            </div>

            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,4vw,32px)", color: "white", marginBottom: 12, lineHeight: 1.2 }}>
              Analysing your contract
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, fontFamily: "'DM Sans',sans-serif" }}>
              This usually takes 30–60 seconds.
            </p>

            {/* Cycling message */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 20px", background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.2)", borderRadius: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 1.4s infinite", flexShrink: 0 }}/>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans',sans-serif", transition: "opacity .3s" }}>
                {MESSAGES[msgIdx]}
              </span>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {[["✓", "Payment confirmed", "#4ade80"], ["⏳", "Analysing clauses", "#8b5cf6"], ["✉", "Report on its way", "rgba(255,255,255,0.2)"]].map(([icon, label, color], i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "rgba(74,222,128,0.12)" : i === 1 ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
                  <span style={{ fontSize: 11, color: color as string, fontFamily: "'DM Sans',sans-serif", textAlign: "center", maxWidth: 80 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Done state ── */
          <div style={{ textAlign: "center", maxWidth: 460, animation: "fadeUp .5s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 32 }}>
              {timedOut ? "📧" : "✓"}
            </div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(24px,4vw,36px)", color: "white", marginBottom: 14, lineHeight: 1.15 }}>
              Your report is on its way
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 32, fontFamily: "'DM Sans',sans-serif" }}>
              Your full contract analysis has been sent to your email. Check your inbox — and spam folder just in case.
            </p>
            <div style={{ background: "rgba(99,102,241,0.07)", border: "0.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
                Your report includes: every clause explained in plain English, all red flags with negotiation scripts, missing protections, and your full fairness score with PDF attached.
              </p>
            </div>
            <a href="/" style={{ display: "inline-block", padding: "12px 28px", fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", borderRadius: 10, textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>
              Analyse another contract
            </a>
          </div>
        )}

        <p style={{ marginTop: 48, fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans',sans-serif", textAlign: "center", maxWidth: 420, lineHeight: 1.65 }}>
          Not legal advice. Educational purposes only. Consult a qualified attorney before signing any contract.
        </p>
      </div>
    </>
  );
}
