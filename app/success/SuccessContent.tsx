"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { ContrivoxAnalysis } from "@/lib/validation";
import { Logo } from "@/components/Logo";

const MESSAGES = [
  "Reading your contract...",
  "Checking for non-compete language...",
  "Scanning arbitration clauses...",
  "Reviewing IP assignment terms...",
  "Checking auto-renewal provisions...",
  "Identifying missing legal protections...",
  "Calculating your fairness score...",
  "Preparing your report...",
];

const TIMEOUT_MS = 120_000;

// Dark-theme colour tokens
const C = {
  bg:      "#07070f",
  surface: "rgba(255,255,255,0.035)",
  border:  "rgba(255,255,255,0.09)",
  text:    "rgba(255,255,255,0.82)",
  muted:   "rgba(255,255,255,0.48)",
  heading: "#ffffff",
};

const SCORE_COLORS: Record<string, string> = {
  Fair:       "#22c55e",
  Acceptable: "#84cc16",
  Concerning: "#f59e0b",
  Unfair:     "#f97316",
  Dangerous:  "#ef4444",
};

const RISK_COLORS: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
};

const FONT       = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── PDF generator (unchanged) ────────────────────────────────────────────────
async function downloadReportPDF(analysis: ContrivoxAnalysis): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - M * 2;
  let y = 20;

  const scoreColors: Record<string, [number, number, number]> = {
    Fair: [34, 197, 94], Acceptable: [132, 204, 22], Concerning: [234, 179, 8],
    Unfair: [249, 115, 22], Dangerous: [239, 68, 68],
  };
  const riskColors: Record<string, [number, number, number]> = {
    high: [210, 40, 40], medium: [190, 130, 0], low: [30, 140, 80],
  };
  const sc = scoreColors[analysis.score_label] ?? [120, 120, 140];

  const nl = (h = 5) => { y += h; if (y > 272) { doc.addPage(); y = 20; } };
  const txt = (text: string, size = 11, bold = false, color: [number, number, number] = [40, 40, 55], maxW = CW) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text ?? ""), maxW);
    if (y + lines.length * (size * 0.38 + 1) > 272) { doc.addPage(); y = 20; }
    doc.text(lines, M, y);
    y += lines.length * (size * 0.38 + 1.5);
  };
  const section = (label: string) => {
    nl(4);
    doc.setFillColor(240, 237, 255);
    doc.roundedRect(M - 3, y - 4, CW + 6, 10, 2, 2, "F");
    txt(label, 10, true, [70, 50, 170]);
    nl(2);
  };

  doc.setFillColor(9, 9, 20); doc.rect(0, 0, W, 40, "F");
  doc.setFillColor(...sc); doc.rect(0, 36, W, 4, "F");
  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text("Contrivox", M, 24);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 160, 255);
  doc.text("AI Contract Analysis Report", M, 32);
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
  doc.text(`${analysis.score}/100 — ${analysis.score_label}`, W - M, 22, { align: "right" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(160, 150, 200);
  doc.text(analysis.contract_type, W - M, 30, { align: "right" });

  y = 52;
  txt(analysis.summary, 10.5, false, [50, 50, 65]);
  nl(2);
  if (analysis.parties?.length) {
    txt(`Parties: ${analysis.parties.join(" · ")}`, 9, false, [110, 100, 130]);
  }

  nl(4);
  doc.setFillColor(245, 243, 255); doc.roundedRect(M - 3, y - 4, CW + 6, 24, 3, 3, "F");
  txt("Score Reasoning", 9, true, [90, 70, 170]);
  txt(analysis.score_reasoning, 10, false, [50, 50, 65]);
  nl(2);

  section("Our Recommendation");
  txt(analysis.overall_recommendation, 10.5, false, [50, 50, 65]);

  section("Key Clauses");
  (analysis.key_clauses ?? []).forEach((c, i) => {
    if (y > 258) { doc.addPage(); y = 20; }
    const rc = riskColors[c.risk_level] ?? [100, 100, 110] as [number, number, number];
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...rc);
    doc.text(`${i + 1}. [${(c.risk_level ?? "").toUpperCase()}]`, M, y);
    doc.setTextColor(30, 30, 45);
    const tl = doc.splitTextToSize(c.title ?? "", CW - 22);
    doc.text(tl, M + 22, y);
    y += Math.max(5, tl.length * 4);
    txt(c.plain_english, 9.5, false, [65, 65, 80]);
    if (c.risk_note) txt(`! ${c.risk_note}`, 9, false, [180, 55, 55]);
    nl(2);
  });

  section("Red Flags");
  (analysis.red_flags ?? []).forEach((f, i) => {
    if (y > 258) { doc.addPage(); y = 20; }
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(195, 35, 35);
    const il = doc.splitTextToSize(`${i + 1}. ${f.issue ?? ""}`, CW);
    doc.text(il, M, y); y += il.length * 4.5;
    txt(f.why_it_matters, 9.5, false, [65, 65, 80]);
    if (f.challengeable && f.challenge) {
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(75, 65, 175);
      doc.text("Negotiation script:", M, y); y += 4;
      txt(f.challenge, 9, false, [75, 65, 175]);
    }
    nl(3);
  });

  if (analysis.missing_protections?.length) {
    section("Missing Protections");
    analysis.missing_protections.forEach(m => { txt(`• ${m}`, 9.5, false, [65, 65, 80]); nl(1); });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 237, 255); doc.rect(0, 284, W, 13, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 100, 140);
    const disc = doc.splitTextToSize(analysis.disclaimer ?? "Contrivox is not a law firm. For informational purposes only.", CW);
    doc.text(disc[0] ?? "", M, 290);
    doc.setFontSize(8); doc.setTextColor(140, 130, 170);
    doc.text(`${i} / ${pages}`, W - M, 290, { align: "right" });
  }

  doc.save("Contrivox-Report.pdf");
}

// ─── Inline report sub-components ─────────────────────────────────────────────
function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = SCORE_COLORS[label] ?? "#f59e0b";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle
          cx={64} cy={64} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        <text x={64} y={60} textAnchor="middle" fill="white" fontSize={28} fontWeight={700} fontFamily={FONT}>{score}</text>
        <text x={64} y={78} textAnchor="middle" fill="rgba(255,255,255,0.48)" fontSize={11} fontFamily={FONT}>/100</text>
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: 15, fontFamily: FONT }}>{label}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: "high" | "medium" | "low" }) {
  const color = RISK_COLORS[level];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 600, color, fontFamily: FONT,
      background: `${color}22`, border: `1px solid ${color}44`,
      textTransform: "capitalize", flexShrink: 0,
    }}>
      {level} risk
    </span>
  );
}

function InlineReport({ analysis }: { analysis: ContrivoxAnalysis }) {
  return (
    <div style={{ marginTop: 40, textAlign: "left" }}>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 32 }} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{
            padding: "4px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: "rgba(139,92,246,0.15)", color: "#a78bfa", fontFamily: FONT,
          }}>
            {analysis.contract_type}
          </span>
          {analysis.governing_state && (
            <span style={{ color: C.muted, fontSize: 13, fontFamily: FONT }}>
              Governing state: {analysis.governing_state}
            </span>
          )}
        </div>
        {analysis.parties?.length > 0 && (
          <div style={{ color: C.muted, fontSize: 14, fontFamily: FONT }}>
            {analysis.parties.join(" · ")}
          </div>
        )}
      </div>

      {/* Score + Summary */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 28, padding: 24, borderRadius: 16,
        border: `1px solid ${C.border}`, background: C.surface, marginBottom: 32, alignItems: "flex-start",
      }}>
        <ScoreRing score={analysis.score} label={analysis.score_label} />
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: C.heading, fontFamily: FONT, margin: "0 0 10px" }}>Executive Summary</h2>
          <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14, marginBottom: 12, fontFamily: FONT, margin: "0 0 12px" }}>
            {analysis.summary}
          </p>
          <p style={{ color: C.text, lineHeight: 1.7, fontSize: 14, fontStyle: "italic", fontFamily: FONT, margin: 0 }}>
            {analysis.score_reasoning}
          </p>
        </div>
      </div>

      {/* Red Flags */}
      {analysis.red_flags?.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: C.heading, fontFamily: FONT, margin: "0 0 16px" }}>
            Red Flags ({analysis.red_flags.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {analysis.red_flags.map((flag, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 14,
                border: flag.urgency === "high" ? "1px solid rgba(239,68,68,0.35)" : `1px solid ${C.border}`,
                background: flag.urgency === "high" ? "rgba(239,68,68,0.06)" : C.surface,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, display: "inline-block",
                    background: flag.urgency === "high" ? "#ef4444" : "#f59e0b",
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.heading, fontFamily: FONT }}>{flag.issue}</span>
                  {flag.urgency && (
                    <span style={{
                      marginLeft: "auto", padding: "2px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600, fontFamily: FONT,
                      color: flag.urgency === "high" ? "#ef4444" : "#f59e0b",
                      background: flag.urgency === "high" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                    }}>
                      {flag.urgency === "high" ? "High priority" : "Medium priority"}
                    </span>
                  )}
                </div>
                <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT, margin: `0 0 ${flag.challengeable && flag.challenge ? 14 : 0}px` }}>
                  <strong style={{ color: C.text }}>Why it matters:</strong> {flag.why_it_matters}
                </p>
                {flag.challengeable && flag.challenge && (
                  <div style={{
                    padding: 14, borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: 0.8, fontFamily: FONT,
                    }}>
                      Negotiation Script
                    </div>
                    <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.7, fontStyle: "italic", fontFamily: FONT, margin: 0 }}>
                      &ldquo;{flag.challenge}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Clauses */}
      {analysis.key_clauses?.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: C.heading, fontFamily: FONT, margin: "0 0 16px" }}>
            Key Clauses ({analysis.key_clauses.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analysis.key_clauses.map((clause, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.heading, fontFamily: FONT }}>{clause.title}</span>
                  <RiskBadge level={clause.risk_level} />
                </div>
                <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT, margin: 0 }}>
                  {clause.plain_english}
                </p>
                {clause.risk_note && (
                  <p style={{ color: C.text, fontSize: 13, lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontFamily: FONT, marginBottom: 0 }}>
                    <strong>Note:</strong> {clause.risk_note}
                  </p>
                )}
                {clause.us_legal_context && (
                  <p style={{ color: C.muted, fontSize: 12, marginTop: 8, fontStyle: "italic", fontFamily: FONT, marginBottom: 0 }}>
                    {clause.us_legal_context}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missing Protections */}
      {analysis.missing_protections?.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: C.heading, fontFamily: FONT, margin: "0 0 14px" }}>
            Missing Protections
          </h2>
          <div style={{ padding: 20, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface }}>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.missing_protections.map((item, i) => (
                <li key={i} style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6, fontFamily: FONT }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Overall Recommendation */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: C.heading, fontFamily: FONT, margin: "0 0 14px" }}>
          Overall Recommendation
        </h2>
        <div style={{
          padding: 20, borderRadius: 14,
          border: "1px solid rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)",
        }}>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
            {analysis.overall_recommendation}
          </p>
        </div>
      </section>

      {analysis.disclaimer && (
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, textAlign: "center", opacity: 0.65, fontFamily: FONT, margin: 0 }}>
          {analysis.disclaimer}
        </p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SuccessContent() {
  const searchParams  = useSearchParams();
  const stripeSession = searchParams.get("session_id");

  const [msgIdx, setMsgIdx]               = useState(0);
  const [msgVisible, setMsgVisible]       = useState(true);
  const [done, setDone]                   = useState(false);
  const [timedOut, setTimedOut]           = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [analysis, setAnalysis]           = useState<ContrivoxAnalysis | null>(null);
  const [downloading, setDownloading]     = useState(false);
  const [copied, setCopied]               = useState(false);

  const startRef = useRef(Date.now());
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stripeSession) return;

    msgRef.current = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 300);
    }, 8000);

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
          if (data.status === "error") setAnalysisError(true);
          if (data.analysis) setAnalysis(data.analysis as ContrivoxAnalysis);
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

  const handleDownload = useCallback(async () => {
    if (!analysis || downloading) return;
    setDownloading(true);
    try {
      await downloadReportPDF(analysis);
    } catch (e) {
      console.error("[report] PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [analysis, downloading]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText("https://contrivox.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, []);

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://contrivox.com")}`;
  const hasFullReport = analysis && !timedOut && !analysisError;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#07070f;font-family:'DM Sans',sans-serif;}
        :root{--cvx-heading:#ffffff;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-text{transition:opacity .3s ease;}
        .share-btn:hover{opacity:0.85;}
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "40px 20px 80px" }}>

        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <Logo height={28} />
        </div>

        {!done ? (
          /* ── Analysing state ── */
          <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
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

            <h1 style={{ fontFamily: FONT_SERIF, fontSize: "clamp(22px,4vw,32px)", color: "white", marginBottom: 12, lineHeight: 1.2 }}>
              Analysing your contract
            </h1>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, fontFamily: FONT }}>
              This usually takes 60 seconds.
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 20px", background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.2)", borderRadius: 24, minWidth: 300 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 1.4s infinite", flexShrink: 0 }}/>
              <span className="msg-text" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: FONT, opacity: msgVisible ? 1 : 0 }}>
                {MESSAGES[msgIdx]}
              </span>
            </div>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {([["✓", "Payment confirmed", "#4ade80"], ["⏳", "Analysing clauses", "#8b5cf6"], ["✉", "Report on its way", "rgba(255,255,255,0.2)"]] as const).map(([icon, label, color], i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "rgba(74,222,128,0.12)" : i === 1 ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
                  <span style={{ fontSize: 11, color, fontFamily: FONT, textAlign: "center", maxWidth: 80 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Done state ── */
          <div style={{ width: "100%", maxWidth: hasFullReport ? 760 : 480, animation: "fadeUp .5s ease" }}>

            {/* Hero — centered */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M7 16l6 6 12-12" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h1 style={{ fontFamily: FONT_SERIF, fontSize: "clamp(24px,4vw,36px)", color: "white", marginBottom: 12, lineHeight: 1.15 }}>
                {analysisError
                  ? "Analysis failed"
                  : timedOut
                    ? "Your report is being delivered"
                    : "Your report is ready."}
              </h1>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 28, fontFamily: FONT, maxWidth: 440 }}>
                {analysisError
                  ? "We couldn't analyse this document. Please try uploading your contract again — if the issue persists, contact support."
                  : timedOut
                    ? "Analysis is taking a bit longer than expected. Your report will be delivered to your email shortly."
                    : "Your full contract analysis is complete. Download the PDF or read it below."}
              </p>

              {/* Primary actions */}
              <div style={{ width: "100%", maxWidth: 440 }}>
                {hasFullReport && (
                  <>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      style={{
                        width: "100%", padding: "16px", fontSize: 15, fontWeight: 700,
                        background: downloading ? "rgba(124,58,237,0.45)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                        color: "white", border: "none", borderRadius: 12,
                        cursor: downloading ? "not-allowed" : "pointer",
                        fontFamily: FONT, marginBottom: 8,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        boxShadow: downloading ? "none" : "0 4px 24px rgba(99,102,241,0.4)",
                        letterSpacing: "0.01em", transition: "all .2s",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {downloading ? "Generating PDF…" : "Download My Report"}
                    </button>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: FONT, marginBottom: 10 }}>
                      Download link expires in 24 hours
                    </p>
                    {/* Inbox confirmation */}
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", fontFamily: FONT, marginBottom: 20 }}>
                      📩 A copy has been sent to your inbox
                    </p>
                  </>
                )}

                <a
                  href="/"
                  style={{
                    display: "block", width: "100%", padding: "13px", fontSize: 14, fontWeight: 600,
                    background: "transparent", color: "rgba(255,255,255,0.6)",
                    border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 12,
                    textDecoration: "none", fontFamily: FONT, marginBottom: 0,
                    textAlign: "center",
                  }}
                >
                  Analyse Another Contract
                </a>
              </div>
            </div>

            {/* Inline full report */}
            {hasFullReport && <InlineReport analysis={analysis} />}

            {/* Share section */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginTop: 32 }}>
              <p style={{ fontSize: 12, color: C.muted, fontFamily: FONT, marginBottom: 12, lineHeight: 1.5, textAlign: "center" }}>
                Found this useful? Share Contrivox with someone who has a contract to sign.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "#0a66c2", color: "white", borderRadius: 8, textDecoration: "none", fontFamily: FONT, transition: "opacity .15s" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Share on LinkedIn
                </a>
                <button
                  onClick={handleCopyLink}
                  className="share-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", fontFamily: FONT, transition: "opacity .15s" }}
                >
                  {copied ? "✓ Copied!" : "Copy link"}
                </button>
              </div>
            </div>

          </div>
        )}

        <p style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.16)", fontFamily: FONT, textAlign: "center", maxWidth: 460, lineHeight: 1.65 }}>
          Not legal advice. Educational purposes only. Consult a qualified attorney before signing any contract.
        </p>
      </div>
    </>
  );
}
