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

const TIMEOUT_MS = 240_000;
const SLOW_MS    = 90_000;

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
  const r = 84;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, flexShrink: 0 }}>
      <div style={{ filter: `drop-shadow(0 0 18px ${color}55)` }}>
        <svg width={200} height={200} viewBox="0 0 200 200">
          <circle cx={100} cy={100} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={14} />
          <circle
            cx={100} cy={100} r={r}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeDasharray={`${fill} ${circ - fill}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
          />
          <text x={100} y={90} textAnchor="middle" fill="white" fontSize={52} fontWeight={800} fontFamily={FONT}>{score}</text>
          <text x={100} y={114} textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize={14} fontFamily={FONT}>/100</text>
        </svg>
      </div>
      <div style={{
        padding: "5px 20px", borderRadius: 999,
        background: `${color}20`, border: `1.5px solid ${color}55`,
        color, fontWeight: 700, fontSize: 15, fontFamily: FONT, letterSpacing: "0.02em",
      }}>
        {label}
      </div>
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

const SH = (label: string, accent = "#7c3aed") => ({
  display: "flex" as const, alignItems: "center" as const, gap: 10,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.09em",
  textTransform: "uppercase" as const, color: "rgba(255,255,255,0.45)",
  margin: "0 0 20px", fontFamily: FONT,
  paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
});

function SectionHeader({ label, accent = "#7c3aed" }: { label: string; accent?: string }) {
  return (
    <div style={SH(label, accent)}>
      <span style={{ width: 3, height: 13, borderRadius: 2, background: accent, display: "inline-block", flexShrink: 0 }} />
      {label}
    </div>
  );
}

const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function InlineReport({ analysis, tier, onUpgrade }: {
  analysis: ContrivoxAnalysis;
  tier: "basic" | "full";
  onUpgrade?: () => void;
}) {
  const sortedClauses = [...(analysis.key_clauses ?? [])].sort(
    (a, b) => (RISK_ORDER[a.risk_level] ?? 2) - (RISK_ORDER[b.risk_level] ?? 2)
  );
  const firstClause   = sortedClauses[0];
  const lockedClauses = sortedClauses.slice(1);

  return (
    <div style={{ marginTop: 40, textAlign: "left" }}>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 36 }} />

      {/* Contract meta */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{
            padding: "4px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: "rgba(139,92,246,0.15)", color: "#a78bfa", fontFamily: FONT,
          }}>
            {analysis.contract_type}
          </span>
          {analysis.governing_state && (
            <span style={{ color: C.muted, fontSize: 13, fontFamily: FONT }}>
              {analysis.governing_state}
            </span>
          )}
        </div>
        {analysis.parties?.length > 0 && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: FONT }}>
            {analysis.parties.join(" · ")}
          </div>
        )}
      </div>

      {/* Score — hero element */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "40px 28px 32px", borderRadius: 20,
        border: `1px solid ${C.border}`, background: C.surface, marginBottom: 40,
      }}>
        <ScoreRing score={analysis.score} label={analysis.score_label} />
        <div style={{ marginTop: 28, textAlign: "center", maxWidth: 560 }}>
          <p style={{ color: C.muted, lineHeight: 1.75, fontSize: 15, marginBottom: 14, fontFamily: FONT }}>
            {analysis.summary}
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: 13.5, fontStyle: "italic", fontFamily: FONT, margin: 0 }}>
            {analysis.score_reasoning}
          </p>
        </div>
      </div>

      {/* Key Clauses — shown first so the free top clause appears before any blurred content */}
      {sortedClauses.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <SectionHeader label={`Key Clauses — ${sortedClauses.length}`} accent="#f59e0b" />

          {tier === "basic" && (
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", fontFamily: FONT, marginBottom: 14 }}>
              Showing 1 of {sortedClauses.length} clause{sortedClauses.length !== 1 ? "s" : ""} — unlock to see all
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(tier === "full" ? sortedClauses : (firstClause ? [firstClause] : [])).map((clause, i) => {
              const borderColor = RISK_COLORS[clause.risk_level] ?? C.border;
              return (
                <div key={i} style={{
                  padding: "18px 18px 18px 18px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${borderColor}`,
                  background: C.surface,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: C.heading, fontFamily: FONT, flex: 1 }}>{clause.title}</span>
                    <RiskBadge level={clause.risk_level} />
                  </div>
                  <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT, margin: 0 }}>
                    {clause.plain_english}
                  </p>
                  {clause.risk_note && (
                    <p style={{ color: C.text, fontSize: 12.5, lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontFamily: FONT, marginBottom: 0 }}>
                      {clause.risk_note}
                    </p>
                  )}
                  {clause.us_legal_context && (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8, fontStyle: "italic", fontFamily: FONT, marginBottom: 0 }}>
                      {clause.us_legal_context}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Locked clauses preview — basic tier only */}
          {tier === "basic" && lockedClauses.length > 0 && (
            <div style={{ position: "relative", marginTop: 10, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {lockedClauses.slice(0, 2).map((clause, i) => {
                  const borderColor = RISK_COLORS[clause.risk_level] ?? C.border;
                  return (
                    <div key={i} style={{
                      padding: "18px", borderRadius: 12,
                      border: `1px solid ${C.border}`, borderLeft: `4px solid ${borderColor}`,
                      background: C.surface,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: C.heading, fontFamily: FONT, flex: 1 }}>{clause.title}</span>
                        <RiskBadge level={clause.risk_level} />
                      </div>
                      <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT, margin: 0 }}>{clause.plain_english}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(7,7,15,0.05) 0%, rgba(7,7,15,0.82) 55%)",
                display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 20,
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(167,139,250,0.9)", fontFamily: FONT }}>
                  🔒 {lockedClauses.length} more clause{lockedClauses.length !== 1 ? "s" : ""} — unlock to read all
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Red Flags */}
      {analysis.red_flags?.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <SectionHeader label={`Red Flags — ${analysis.red_flags.length}`} accent="#ef4444" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analysis.red_flags.map((flag, i) => {
              const borderColor = flag.urgency === "high" ? "#ef4444" : flag.urgency === "medium" ? "#f59e0b" : "#22c55e";
              return (
                <div key={i} style={{
                  padding: "20px 20px 20px 20px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${borderColor}`,
                  background: flag.urgency === "high" ? "rgba(239,68,68,0.04)" : C.surface,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.heading, fontFamily: FONT, flex: 1 }}>{flag.issue}</span>
                    {flag.urgency && (
                      <span style={{
                        padding: "2px 10px", borderRadius: 999, flexShrink: 0,
                        fontSize: 11, fontWeight: 600, fontFamily: FONT,
                        color: borderColor, background: `${borderColor}18`,
                        border: `1px solid ${borderColor}40`,
                      }}>
                        {flag.urgency === "high" ? "High" : flag.urgency === "medium" ? "Medium" : "Low"}
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: C.muted, fontSize: 13.5, lineHeight: 1.7, fontFamily: FONT,
                    margin: `0 0 ${tier === "full" && flag.challengeable && flag.challenge ? 14 : 0}px`,
                    filter: tier === "basic" ? "blur(3.5px)" : "none",
                    userSelect: tier === "basic" ? "none" : "auto",
                  }}>
                    {flag.why_it_matters}
                  </p>
                  {tier === "full" && flag.challengeable && flag.challenge && (
                    <div style={{
                      padding: "12px 16px", borderRadius: 10,
                      background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 6,
                        textTransform: "uppercase", letterSpacing: 1, fontFamily: FONT,
                      }}>
                        Negotiation Script
                      </div>
                      <p style={{ color: "#c4b5fd", fontSize: 13.5, lineHeight: 1.7, fontStyle: "italic", fontFamily: FONT, margin: 0 }}>
                        &ldquo;{flag.challenge}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Missing Protections */}
      {analysis.missing_protections?.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <SectionHeader label="Missing Protections" accent="#f97316" />
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "18px 20px", borderRadius: 12,
              border: `1px solid ${C.border}`, background: C.surface,
              filter: tier === "basic" ? "blur(4px)" : "none",
              userSelect: tier === "basic" ? "none" : "auto",
              pointerEvents: tier === "basic" ? "none" : "auto",
            }}>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.missing_protections.map((item, i) => (
                  <li key={i} style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT }}>{item}</li>
                ))}
              </ul>
            </div>
            {tier === "basic" && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(7,7,15,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(167,139,250,0.9)", fontFamily: FONT }}>
                  🔒 {analysis.missing_protections.length} missing protection{analysis.missing_protections.length !== 1 ? "s" : ""} — unlock to see all
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Inline upsell card — basic tier only */}
      {tier === "basic" && onUpgrade && (
        <div style={{
          padding: "28px 24px", borderRadius: 16, marginBottom: 44,
          background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.3)",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 22, color: "white", marginBottom: 8, lineHeight: 1.2 }}>
            Unlock Your Full Report
          </p>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginBottom: 6, fontFamily: FONT }}>
            All clauses explained · Negotiation scripts · Missing protections · PDF download
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginBottom: 22, fontStyle: "italic", fontFamily: FONT }}>
            Most users unlock after seeing their risk score.
          </p>
          <button
            onClick={onUpgrade}
            style={{
              padding: "14px 40px", fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "white", border: "none", borderRadius: 12,
              cursor: "pointer", fontFamily: FONT,
              boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
            }}
          >
            Unlock Full Report — $15
          </button>
        </div>
      )}

      {/* Overall Recommendation */}
      <section style={{ marginBottom: 44 }}>
        <SectionHeader label="Overall Recommendation" accent="#7c3aed" />
        <div style={{
          padding: "20px 22px", borderRadius: 12,
          border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.07)",
        }}>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, margin: 0, fontFamily: FONT }}>
            {analysis.overall_recommendation}
          </p>
        </div>
      </section>

      {analysis.disclaimer && (
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, lineHeight: 1.6, textAlign: "center", fontFamily: FONT, margin: 0 }}>
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
  const urlPlan       = searchParams.get("plan") ?? "basic";

  const [msgIdx, setMsgIdx]                       = useState(0);
  const [msgVisible, setMsgVisible]               = useState(true);
  const [done, setDone]                           = useState(false);
  const [slow, setSlow]                           = useState(false);
  const [timedOut, setTimedOut]                   = useState(false);
  const [analysisError, setAnalysisError]         = useState(false);
  const [analysis, setAnalysis]                   = useState<ContrivoxAnalysis | null>(null);
  const [reportTier, setReportTier]               = useState<"basic" | "full">("basic");
  const [contractSessionId, setContractSessionId] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading]       = useState(false);
  const [unlockBanner, setUnlockBanner]           = useState(false);
  const [downloading, setDownloading]             = useState(false);
  const [copied, setCopied]                       = useState(false);
  const [retryCount, setRetryCount]               = useState(0);

  const startRef = useRef(Date.now());
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stripeSession) return;

    // Reset transient states on each retry
    setSlow(false);
    setTimedOut(false);
    setAnalysisError(false);
    setAnalysis(null);
    setDone(false);
    startRef.current = Date.now();

    msgRef.current = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 300);
    }, 8000);

    const isUpgradePoll = urlPlan === "upgrade";
    const activeTimeout = isUpgradePoll ? 120_000 : TIMEOUT_MS;
    const pollInterval  = isUpgradePoll ? 2000 : 5000;

    const poll = async () => {
      const elapsed = Date.now() - startRef.current;
      if (elapsed >= activeTimeout) {
        clearInterval(pollRef.current!);
        clearInterval(msgRef.current!);
        setTimedOut(true);
        setDone(true);
        return;
      }
      if (!isUpgradePoll && elapsed >= SLOW_MS) setSlow(true);
      try {
        const res  = await fetch(`/api/contract/status?stripe_session=${stripeSession}`);
        const data = await res.json();
        if (data.status === "done" || data.status === "error") {
          // For upgrade flow, keep polling until webhook promotes report_tier to "full"
          if (isUpgradePoll && data.report_tier !== "full") return;
          clearInterval(pollRef.current!);
          clearInterval(msgRef.current!);
          if (data.status === "error") setAnalysisError(true);
          if (data.analysis) setAnalysis(data.analysis as ContrivoxAnalysis);
          setReportTier((data.report_tier === "full" ? "full" : "basic") as "basic" | "full");
          setContractSessionId(data.contract_session_id ?? null);
          if (isUpgradePoll && data.report_tier === "full") {
            setUnlockBanner(true);
            setTimeout(() => setUnlockBanner(false), 2500);
          }
          setDone(true);
        }
      } catch {
        // network blip — keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (msgRef.current)  clearInterval(msgRef.current);
    };
  }, [stripeSession, retryCount]);

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

  const handleRetry = useCallback(() => {
    setRetryCount(c => c + 1);
  }, []);

  const handleUpgrade = useCallback(async () => {
    if (upgradeLoading || !contractSessionId) return;
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "upgrade", sessionId: contractSessionId }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setUpgradeLoading(false);
    }
  }, [upgradeLoading, contractSessionId]);

  const linkedInUrl   = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://contrivox.com")}`;
  const hasFullReport = analysis && !timedOut && !analysisError;
  const isUpgrade     = urlPlan === "upgrade";

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
        @keyframes glowPulse{0%,100%{box-shadow:0 4px 28px rgba(99,102,241,0.45),0 0 0 0 rgba(124,58,237,0.25);}60%{box-shadow:0 6px 36px rgba(99,102,241,0.7),0 0 0 10px rgba(124,58,237,0.0);}}
        .msg-text{transition:opacity .3s ease;}
        .share-btn:hover{opacity:0.85;}
        .dl-btn{animation:glowPulse 2.8s ease-in-out infinite;}
        @keyframes checkPop{0%{opacity:0;transform:scale(0.3)}70%{transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
        @keyframes bannerSlide{0%{opacity:0;transform:translateX(-50%) translateY(-12px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}
      `}</style>

      {/* Sticky bottom bar — upgrade CTA for basic, or "Analyse Another" for full */}
      {hasFullReport && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          padding: "12px 20px",
          background: "rgba(7,7,15,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "center", alignItems: "center", gap: 12,
        }}>
          {reportTier === "basic" ? (
            <>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading || !contractSessionId}
                  style={{
                    padding: "11px 32px", borderRadius: 10,
                    background: upgradeLoading ? "rgba(124,58,237,0.45)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "white", border: "none",
                    fontSize: 14, fontWeight: 700,
                    cursor: upgradeLoading || !contractSessionId ? "not-allowed" : "pointer",
                    fontFamily: FONT,
                    boxShadow: upgradeLoading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                    minHeight: 44,
                  }}
                >
                  {upgradeLoading ? "Redirecting…" : "Unlock Full Report — $15"}
                </button>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 5, fontFamily: FONT }}>
                  Most users unlock after seeing their risk score.
                </p>
              </div>
              <a href="/" style={{
                padding: "9px 18px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)", fontSize: 12,
                textDecoration: "none", fontFamily: FONT, fontWeight: 600,
                flexShrink: 0, whiteSpace: "nowrap",
              }}>
                ← New analysis
              </a>
            </>
          ) : (
            <a href="/" style={{
              padding: "9px 32px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.65)",
              fontSize: 13, fontWeight: 600,
              textDecoration: "none", fontFamily: FONT,
            }}>
              ← Analyse Another Contract
            </a>
          )}
        </div>
      )}

      {/* Unlock success banner */}
      {unlockBanner && (
        <div style={{
          position: "fixed", top: 20, left: "50%", zIndex: 100,
          padding: "12px 22px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.35)",
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 10,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "bannerSlide 2.5s ease forwards",
          pointerEvents: "none",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "checkPop 0.4s ease forwards", flexShrink: 0 }}>
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: FONT, whiteSpace: "nowrap" }}>
            Full report unlocked
          </span>
        </div>
      )}

      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: `40px 20px ${hasFullReport ? "100px" : "80px"}` }}>

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
              {isUpgrade
                ? "Unlocking your full report…"
                : slow
                  ? "Still working on your report…"
                  : "Analysing your contract"}
            </h1>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, fontFamily: FONT }}>
              {isUpgrade
                ? "Activating your upgrade — this takes just a moment."
                : slow
                  ? "This contract is taking a bit longer than usual. Please keep this page open — your report will appear here when it's ready."
                  : "This usually takes 60–90 seconds."}
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 20px", background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.2)", borderRadius: 24, minWidth: 300 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 1.4s infinite", flexShrink: 0 }}/>
              <span className="msg-text" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: FONT, opacity: msgVisible ? 1 : 0 }}>
                {MESSAGES[msgIdx]}
              </span>
            </div>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {([
                ["✓", "Payment confirmed", "#4ade80"],
                ["⏳", isUpgrade ? "Activating upgrade" : "Analysing clauses", "#8b5cf6"],
                [isUpgrade ? "⚡" : urlPlan === "pro" ? "✉" : "📊", isUpgrade ? "Full report ready soon" : urlPlan === "pro" ? "Report on its way" : "Results loading", "rgba(255,255,255,0.2)"],
              ] as const).map(([icon, label, color], i) => (
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
                    ? "Still processing your report…"
                    : "Your report is ready."}
              </h1>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 28, fontFamily: FONT, maxWidth: 440 }}>
                {analysisError
                  ? "We couldn't analyse this document. Please try uploading your contract again — if the issue persists, contact support."
                  : timedOut
                    ? "Your report is still being prepared. Click below to check again, or wait for the email copy to arrive in your inbox."
                    : reportTier === "full"
                      ? urlPlan === "upgrade"
                        ? "Your full report is unlocked. Everything is now visible below."
                        : urlPlan === "pro"
                          ? "Your full contract analysis is complete. Download the PDF or read it below."
                          : "Your full report is ready. Read it below."
                      : "Your contract analysis is ready. Read it below."}
              </p>

              {/* Primary actions */}
              <div style={{ width: "100%", maxWidth: 440 }}>
                {hasFullReport && reportTier === "full" && urlPlan !== "upgrade" && urlPlan !== "basic" && (
                  <>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className={downloading ? undefined : "dl-btn"}
                      style={{
                        width: "100%", padding: "18px", fontSize: 16, fontWeight: 700,
                        background: downloading ? "rgba(124,58,237,0.45)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                        color: "white", border: "none", borderRadius: 13,
                        cursor: downloading ? "not-allowed" : "pointer",
                        fontFamily: FONT, marginBottom: 10,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {downloading ? "Generating PDF…" : "Download My Report"}
                    </button>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", fontFamily: FONT, marginBottom: 24, textAlign: "center" }}>
                      📩 A copy has been sent to your inbox
                    </p>
                  </>
                )}

                {/* PDF download for upgrade buyers — email was already sent after original $9 analysis */}
                {hasFullReport && reportTier === "full" && (urlPlan === "upgrade" || urlPlan === "basic") && (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={downloading ? undefined : "dl-btn"}
                    style={{
                      width: "100%", padding: "18px", fontSize: 16, fontWeight: 700,
                      background: downloading ? "rgba(124,58,237,0.45)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      color: "white", border: "none", borderRadius: 13,
                      cursor: downloading ? "not-allowed" : "pointer",
                      fontFamily: FONT, marginBottom: 24,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      letterSpacing: "0.01em",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {downloading ? "Generating PDF…" : "Download My Report"}
                  </button>
                )}

                {timedOut && (
                  <button
                    onClick={handleRetry}
                    style={{
                      width: "100%", padding: "15px", fontSize: 15, fontWeight: 700,
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      color: "white", border: "none", borderRadius: 13,
                      cursor: "pointer", fontFamily: FONT, marginBottom: 10,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    Check again
                  </button>
                )}

                {!hasFullReport && !timedOut && (
                  <a
                    href="/"
                    style={{
                      display: "block", width: "100%", padding: "14px", fontSize: 14, fontWeight: 600,
                      background: "transparent", color: "rgba(255,255,255,0.6)",
                      border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 12,
                      textDecoration: "none", fontFamily: FONT, textAlign: "center",
                    }}
                  >
                    Analyse Another Contract
                  </a>
                )}
              </div>
            </div>

            {/* Inline full report */}
            {hasFullReport && (
              <InlineReport
                analysis={analysis}
                tier={reportTier}
                onUpgrade={reportTier === "basic" ? handleUpgrade : undefined}
              />
            )}

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
