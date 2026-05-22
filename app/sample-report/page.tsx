import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample Contract Analysis Report — Contrivox",
  description:
    "See exactly what you get when you upload a contract to Contrivox. This sample report shows a full analysis of an employment agreement — red flags, fairness score, and negotiation scripts.",
  robots: { index: true, follow: true },
};

// Static sample data — fictional "Alex Rivera" / "Meridian Technologies"
const REPORT = {
  contract_type: "Employment Agreement",
  parties: ["Alex Rivera (Employee)", "Meridian Technologies, Inc. (Employer)"],
  governing_state: "California",
  score: 61,
  score_label: "Concerning" as const,
  score_reasoning:
    "This agreement contains several clauses that significantly favor the employer. While the compensation terms are reasonable, the non-compete, IP assignment, and mandatory arbitration provisions create outsized risk for the employee.",
  summary:
    "This is a standard employment offer letter from Meridian Technologies for a Senior Software Engineer role at $145,000/year. The contract contains at-will employment language, a 12-month non-compete, a very broad IP assignment clause, and mandatory binding arbitration. California law makes the non-compete unenforceable, but the arbitration clause and IP assignment remain binding concerns.",
  overall_recommendation:
    "Negotiate the IP assignment clause before signing — it currently claims ownership of anything you create, even on your own time, if it's related to the company's business. Also confirm in writing that the non-compete is unenforceable in California. The mandatory arbitration clause is worth pushing back on, as it limits your options if disputes arise.",
  key_clauses: [
    {
      title: "Non-Compete Agreement (12 Months)",
      plain_english:
        "For 12 months after you leave, you cannot work for any company that competes with Meridian in the software industry — anywhere in the United States.",
      risk_level: "high" as const,
      risk_note:
        "In California, non-compete agreements for employees are almost entirely unenforceable under Business and Professions Code §16600. However, this clause could still cause problems if you move to another state.",
      us_legal_context:
        "California Business and Professions Code §16600 makes most employee non-competes void and unenforceable in California.",
    },
    {
      title: "Intellectual Property Assignment",
      plain_english:
        "Anything you invent or create that is 'related to the company's business or actual or demonstrably anticipated research or development' belongs to Meridian — even if you built it on your own time with your own computer.",
      risk_level: "high" as const,
      risk_note:
        "This clause is exceptionally broad. It could claim ownership of side projects, open-source contributions, or personal apps you build outside of work hours.",
      us_legal_context:
        "California Labor Code §2870 limits employer IP claims to inventions that use company resources or relate directly to the employer's business — but 'relates to business' is interpreted broadly by courts.",
    },
    {
      title: "Mandatory Binding Arbitration",
      plain_english:
        "If there's a dispute between you and Meridian — including wage theft, harassment, or wrongful termination — you must go through private arbitration instead of suing in court. You give up your right to a jury trial.",
      risk_level: "high" as const,
      risk_note:
        "Arbitration is typically faster and cheaper for employers. Studies show employees win less often and receive lower awards in arbitration than in court. You also cannot join class action lawsuits.",
      us_legal_context:
        "The Federal Arbitration Act (FAA) generally makes these clauses enforceable. California's attempt to ban mandatory employment arbitration (AB 51) was struck down by federal courts.",
    },
    {
      title: "At-Will Employment",
      plain_english:
        "Either you or Meridian can end the employment relationship at any time, for any reason (or no reason at all), as long as it's not an illegal reason like discrimination.",
      risk_level: "medium" as const,
      risk_note:
        "This is standard in most US employment contracts. However, it means you have no guaranteed job security regardless of your performance.",
      us_legal_context:
        "At-will employment is the default rule in all US states except Montana. Courts have recognized exceptions for implied contracts and public policy violations.",
    },
    {
      title: "Non-Solicitation of Employees (18 Months)",
      plain_english:
        "For 18 months after you leave Meridian, you cannot try to hire or recruit any Meridian employees to join your new company.",
      risk_level: "medium" as const,
      risk_note:
        "Unlike non-competes, employee non-solicitation clauses have more complex treatment under California law. Recent cases suggest they may be enforceable in narrow circumstances.",
      us_legal_context:
        "The enforceability of employee non-solicitation clauses in California is unsettled after the 2023 California Supreme Court decision in Ixchel Pharma v. Biogen.",
    },
    {
      title: "15 Days Paid Time Off (PTO)",
      plain_english:
        "You receive 15 days of PTO per year, which does not accrue — it is 'use it or lose it' with no carryover.",
      risk_level: "low" as const,
      risk_note:
        "California law prohibits 'use it or lose it' PTO policies. Accrued PTO is considered wages and cannot be forfeited. This clause may be unenforceable as written.",
      us_legal_context:
        "California Labor Code §227.3 treats accrued vacation as earned wages that must be paid out upon separation — making 'use it or lose it' policies illegal in California.",
    },
  ],
  red_flags: [
    {
      issue: "Overly Broad IP Assignment",
      why_it_matters:
        "You could lose ownership of a weekend app, open-source project, or startup idea if Meridian can claim it's 'related to the company's business.' This has happened to engineers at large tech companies who lost rights to valuable side projects.",
      challenge:
        "I'd like to add a California Labor Code §2870 carve-out to the IP assignment clause. Specifically, I want to exclude inventions developed entirely on my own time, without company resources, and unrelated to the company's current products. Can we add: 'This assignment does not apply to inventions that qualify for exclusion under California Labor Code Section 2870'?",
      challengeable: true,
      urgency: "high" as const,
    },
    {
      issue: "Non-Compete That May Follow You Out of State",
      why_it_matters:
        "While unenforceable in California today, if you ever take a remote job or move to a state like Florida, Texas, or Georgia, this clause could be used to block you from working for competitors — or to threaten you with litigation.",
      challenge:
        "I understand non-competes are unenforceable in California under Business and Professions Code §16600. Can we either remove this clause entirely, or add explicit language confirming it will not be enforced if I remain or relocate within California?",
      challengeable: true,
      urgency: "high" as const,
    },
    {
      issue: "Mandatory Arbitration with Class Action Waiver",
      why_it_matters:
        "If Meridian underpays you or discriminates against a group of employees, the class action waiver means each person must fight individually — making collective action economically impossible. Companies use this to limit legal exposure.",
      challenge:
        "I'd like to negotiate a mutual arbitration clause — one that applies equally to both parties — and remove the class action waiver. Alternatively, I'd like to carve out sexual harassment and discrimination claims from mandatory arbitration, consistent with the Ending Forced Arbitration of Sexual Assault and Sexual Harassment Act.",
      challengeable: true,
      urgency: "medium" as const,
    },
    {
      issue: "'Use It or Lose It' PTO (Illegal in California)",
      why_it_matters:
        "If you leave Meridian with unused PTO, the company may try to deny payout based on this clause — even though California law requires them to pay it. This sets up a potential wage dispute at termination.",
      challenge:
        "The current PTO policy states unused PTO is forfeited at year-end. California Labor Code §227.3 classifies accrued vacation as earned wages — forfeiture policies are illegal in California. Can we revise this to either a carryover policy or a clearly stated cash-out option?",
      challengeable: true,
      urgency: "medium" as const,
    },
  ],
  missing_protections: [
    "No severance clause — you can be terminated with no notice and no pay",
    "No equity vesting acceleration on termination or acquisition",
    "No 'good reason' resignation trigger for constructive dismissal",
    "No written notice requirement before termination (for non-cause situations)",
    "No dispute over IP ownership goes to neutral arbitration — Meridian picks the arbitrator pool",
  ],
};

const SCORE_COLOR: Record<string, string> = {
  Fair:        "#22c55e",
  Acceptable:  "#84cc16",
  Concerning:  "#f59e0b",
  Unfair:      "#f97316",
  Dangerous:   "#ef4444",
};

const RISK_COLOR: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
};

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = SCORE_COLOR[label] ?? "#f59e0b";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={64} cy={64} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
        <circle
          cx={64} cy={64} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x={64} y={60} textAnchor="middle" fill="var(--fg)" fontSize={28} fontWeight={700}>{score}</text>
        <text x={64} y={78} textAnchor="middle" fill="var(--fg-muted)" fontSize={11}>/100</text>
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: 15 }}>{label}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: "high" | "medium" | "low" }) {
  const color = RISK_COLOR[level] ?? "#f59e0b";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      color,
      background: `${color}22`,
      border: `1px solid ${color}44`,
      textTransform: "capitalize",
    }}>
      {level} risk
    </span>
  );
}

export default function SampleReportPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Contrivox" style={{ height: 28, width: "auto" }} />
          </Link>
          <Link href="/" style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}>
            Check My Contract — $9
          </Link>
        </div>
      </nav>

      {/* ── Sample badge ── */}
      <div style={{ background: "#f59e0b22", borderBottom: "1px solid #f59e0b44", padding: "10px 24px", textAlign: "center" }}>
        <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: 14 }}>
          SAMPLE REPORT — This is a fictional contract for demonstration purposes only. All names and companies are made up.
        </span>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 14px",
              borderRadius: 999,
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              fontSize: 13,
              fontWeight: 600,
            }}>
              {REPORT.contract_type}
            </span>
            <span style={{ color: "var(--fg-muted)", fontSize: 13 }}>
              Governing state: {REPORT.governing_state}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
            Employment Agreement Analysis
          </h1>
          <div style={{ color: "var(--fg-muted)", fontSize: 15 }}>
            {REPORT.parties.join(" · ")}
          </div>
        </div>

        {/* ── Score + Summary ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 32,
          padding: 28,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          marginBottom: 40,
          alignItems: "start",
        }}>
          <ScoreRing score={REPORT.score} label={REPORT.score_label} />
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Executive Summary</h2>
            <p style={{ color: "var(--fg-muted)", lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>{REPORT.summary}</p>
            <p style={{ color: "var(--fg)", lineHeight: 1.7, fontSize: 15, fontStyle: "italic" }}>{REPORT.score_reasoning}</p>
          </div>
        </div>

        {/* ── Red Flags ── */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            Red Flags ({REPORT.red_flags.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {REPORT.red_flags.map((flag, i) => (
              <div key={i} style={{
                padding: 24,
                borderRadius: 14,
                border: flag.urgency === "high" ? "1px solid #ef444466" : "1px solid var(--border)",
                background: flag.urgency === "high" ? "#ef444408" : "var(--surface)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block",
                    width: 8, height: 8, borderRadius: "50%",
                    background: flag.urgency === "high" ? "#ef4444" : "#f59e0b",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{flag.issue}</span>
                  <span style={{
                    marginLeft: "auto",
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    color: flag.urgency === "high" ? "#ef4444" : "#f59e0b",
                    background: flag.urgency === "high" ? "#ef444422" : "#f59e0b22",
                  }}>
                    {flag.urgency === "high" ? "High priority" : "Medium priority"}
                  </span>
                </div>
                <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  <strong style={{ color: "var(--fg)" }}>Why it matters:</strong> {flag.why_it_matters}
                </p>
                <div style={{
                  padding: 16,
                  borderRadius: 10,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Negotiation Script
                  </div>
                  <p style={{ color: "var(--fg)", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
                    &ldquo;{flag.challenge}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Key Clauses ── */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            Key Clauses ({REPORT.key_clauses.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {REPORT.key_clauses.map((clause, i) => (
              <div key={i} style={{
                padding: 22,
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{clause.title}</span>
                  <RiskBadge level={clause.risk_level} />
                </div>
                <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: clause.risk_note ? 10 : 0 }}>
                  {clause.plain_english}
                </p>
                {clause.risk_note && (
                  <p style={{ color: "var(--fg)", fontSize: 13, lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    <strong>Note:</strong> {clause.risk_note}
                  </p>
                )}
                {clause.us_legal_context && (
                  <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                    {clause.us_legal_context}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Missing Protections ── */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Missing Protections</h2>
          <div style={{
            padding: 24,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {REPORT.missing_protections.map((item, i) => (
                <li key={i} style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.6 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Overall Recommendation ── */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Overall Recommendation</h2>
          <div style={{
            padding: 24,
            borderRadius: 14,
            border: "1px solid var(--accent)",
            background: "var(--accent-subtle)",
          }}>
            <p style={{ color: "var(--fg)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              {REPORT.overall_recommendation}
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{
          padding: 36,
          borderRadius: 20,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Ready to check your contract?</h2>
          <p style={{ color: "var(--fg-muted)", fontSize: 15, marginBottom: 24 }}>
            Upload your contract and get a full analysis like this one — in 60 seconds, for $9.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            padding: "14px 32px",
            borderRadius: 12,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            minHeight: 48,
            lineHeight: "20px",
          }}>
            Check My Contract — $9 · 60 seconds
          </Link>
          <p style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 12 }}>
            Secure payment via Stripe. No subscription. No account required.
          </p>
        </div>

        {/* ── Legal disclaimer ── */}
        <p style={{ color: "var(--fg-muted)", fontSize: 12, lineHeight: 1.6, marginTop: 40, textAlign: "center", opacity: 0.7 }}>
          This sample is for illustration only and does not constitute legal advice. Contrivox is an AI-powered tool and not a law firm. Consult a qualified attorney before making legal decisions.
        </p>
      </main>
    </div>
  );
}
