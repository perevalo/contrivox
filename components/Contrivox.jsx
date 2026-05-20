import { useState, useEffect, useRef, useCallback } from "react";
import { Analytics } from "@/lib/analytics";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
// Strings live here. To add a language: duplicate this object, translate it,
// store it in locales/<code>.json, add the code to lib/i18n.ts, and restore
// the locale switcher UI in the nav.
const T = {
  en: {
    app_name: "Contrivox",
    app_tagline: "AI contract analysis. Plain language. Instant.",
    nav_cta: "Analyse Free", nav_signin: "Sign In", nav_history: "My Analyses", signout: "Sign out",
    hero_badge: "Most people sign contracts they don't understand",
    hero_h1a: "Your employer, landlord, or client", hero_h1b: "wrote that contract to protect themselves.",
    hero_sub: "Non-competes that ban you from your industry. Arbitration clauses that take away your right to sue. Auto-renewals that charge you for years. Contrivox reads every word — in 30 seconds — so you know exactly what you're agreeing to.",
    stat1v: "91%", stat1l: "of Americans sign contracts without fully reading them",
    stat2v: "1 in 5", stat2l: "US workers are bound by a non-compete they don't understand",
    stat3v: "$18k", stat3l: "average cost of a US employment dispute that could have been avoided",
    fear1t: "Non-competes that follow you for years",
    fear1b: "A single paragraph can ban you from your entire industry for 1–2 years. 30 million Americans are currently bound by a non-compete. Most didn't know what they were signing.",
    fear2t: "Arbitration clauses that silence you",
    fear2b: "Buried on page 4 is a clause waiving your right to sue or join a class action. You agree to private arbitration — chosen by your employer — instead of a real court.",
    fear3t: "Auto-renewals hiding in plain sight",
    fear3b: "Leases, service agreements, and freelance contracts that lock you in automatically. The clause is always there. It's always small print. It always costs more than you expect.",
    upload_title: "Drop your contract. Get your report.", upload_formats: "PDF · PNG · JPG · DOCX · TXT",
    upload_drop: "Tap to choose your contract", upload_or: "or drag and drop",
    out_lang: "Report language", analyse_btn: "Check My Contract — Starting at $9",
    contact_title: "Where should we send your full report?",
    contact_sub: "Enter your email and we'll send the complete analysis automatically.",
    contact_email_label: "Email address", contact_email_ph: "your@email.com",
    contact_wa_label: "WhatsApp (optional)", contact_wa_ph: "+1 555 000 0000",
    contact_wa_opt: "Get a WhatsApp summary too",
    contact_privacy: "Your details are never shared. Used only to deliver your Contrivox report.",
    contact_email_required: "We need your email to send the report.",
    contact_email_invalid: "Please enter a valid email address.",
    auto_sent: "✓ Report sent to", auto_sending: "Sending your report…",
    analysing_msgs: [
      "Reading your contract…",
      "Scanning for non-compete clauses…",
      "Checking arbitration language…",
      "Flagging auto-renewal traps…",
      "Calculating your fairness score…",
      "Building your report…",
    ],
    results_title: "Your Contract Report", score_lbl: "Fairness score",
    tab_clauses: "Key Clauses", tab_flags: "Red Flags", tab_missing: "Missing Protections",
    preview_only: "Preview", showing: "showing", of: "of",
    blur_title: "Unlock your full report",
    blur_sub: "See every clause, all red flags, missing protections, negotiation scripts, and your complete fairness score.",
    unlock_btn: "Unlock Full Report — $9",
    unlock_sub: "One-time payment · instant access · no subscription",
    deliver_title: "Get your full report",
    deliver_sub: "Send the complete PDF to your email or WhatsApp",
    email_placeholder: "your@email.com", whatsapp_placeholder: "+1 555 000 0000",
    send_email: "Send to Email", send_wa: "Send via WhatsApp",
    sending: "Sending…", sent_email: "✓ Sent to your email!", sent_wa: "✓ Sent via WhatsApp!",
    send_error: "Could not send. Please try again.",
    download_pdf: "⬇ Download PDF",
    rec_title: "Our recommendation", score_why: "Why this score",
    risk_high: "High risk", risk_med: "Medium risk", risk_low: "Low risk",
    challenge_btn: "How to negotiate this →", challenge_hide: "Hide",
    not_negotiable: "Non-negotiable clause", suggested: "Negotiation script",
    none_found: "None identified.",
    disclaimer: "Contrivox is not a law firm and does not provide legal advice. This report is for informational purposes only. Consult a qualified lawyer before signing any contract.",
    how_title: "How it works",
    how1t: "Upload in any format", how1b: "PDF, photo, Word doc, or paste text. Any language.",
    how2t: "AI reads every clause", how2b: "Identifies risks, missing protections, and one-sided terms in seconds.",
    how3t: "Get your plain-language report", how3b: "Fairness score, red flags, and exact scripts to negotiate better terms.",
    trust_label: "Trusted by professionals in 40+ countries",
    trust_items: ["Employment contracts", "Lease agreements", "Freelance contracts", "NDAs", "Service agreements", "Business contracts"],
    test_title: "Real people. Real contracts.",
    t1n: "Marcus T.", t1r: "Freelance designer, New York",
    t1t: "Found an IP assignment clause giving my client rights to everything I create — forever. Caught it for $9. Would have cost me years of work.",
    t2n: "Priya S.", t2r: "Software engineer, Austin",
    t2t: "My offer letter had a 2-year non-compete covering all of tech in Texas. I renegotiated before signing. My next job is worth $40k more because of it.",
    t3n: "James R.", t3r: "Renter, Los Angeles",
    t3t: "Auto rent-increase clause on page 8 — 8% every year, no cap. Contrivox caught it in seconds. I negotiated it out before signing the lease.",
    faq_title: "Questions",
    faq1q: "Is this actual legal advice?",
    faq1a: "No. Contrivox is an educational tool that helps you understand what you're signing. We are not a law firm. Always consult a licensed attorney — especially before refusing to sign or renegotiating an employment agreement.",
    faq2q: "What file types can I upload?",
    faq2a: "PDF, JPG, PNG, GIF, WEBP, TXT, and DOCX. Works on any contract in any language — the report comes back in English.",
    faq3q: "What do I get for $3.99?",
    faq3a: "The complete analysis: every clause explained, all red flags detailed, missing protections listed, negotiation scripts for each issue, and your full fairness score. Instant delivery — no subscription.",
    faq4q: "Is my contract private?",
    faq4a: "Yes. Your contract is analysed in memory and never stored on our servers. We don't keep your document after the session ends.",
    faq5q: "How is this different from asking ChatGPT?",
    faq5a: "Contrivox uses a purpose-built legal analysis prompt trained on US contract patterns. It gives you a structured report with a fairness score, categorised red flags, and word-for-word negotiation scripts — not a generic summary.",
    cta_band: "Know exactly what you're signing.",
    footer_copy: "© 2025 Contrivox",
    account_title: "My Analyses", account_empty: "No saved analyses yet. Upload a contract to get started.",
    account_date: "Analysed", account_view: "View report",
    account_signin_prompt: "Sign in to save this analysis to your account.",
    signin_title: "Welcome to Contrivox", signin_email: "Email address", signin_pw: "Password",
    signin_btn: "Sign In", signup_btn: "Create free account", account_name: "Your name",
    modal_close: "Close", save_prompt: "Sign in to save this analysis to your account.",
    overall_rec: "Our recommendation", parties: "Parties", contract_type: "Contract type",
    score_label_map: { Fair:"Fair", Acceptable:"Acceptable", Concerning:"Concerning", Unfair:"Unfair", Dangerous:"Dangerous" },
  },
};

// ─── File extraction ──────────────────────────────────────────────────────────
async function extractFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  return new Promise((res, rej) => {
    const r = new FileReader();
    if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
      r.onload = () => res({ type:"image", data:r.result.split(",")[1], mediaType:file.type });
      r.readAsDataURL(file);
    } else if (ext === "pdf") {
      r.onload = () => res({ type:"pdf", data:r.result.split(",")[1] });
      r.readAsDataURL(file);
    } else {
      r.onload = () => res({ type:"text", text:r.result });
      r.readAsText(file);
    }
    r.onerror = rej;
  });
}

// ─── PDF generator ────────────────────────────────────────────────────────────
async function generatePDF(result, t) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=210, M=18, CW=W-M*2;
  let y=0;

  const scoreCol = { Fair:[34,197,94], Acceptable:[132,204,22], Concerning:[234,179,8], Unfair:[249,115,22], Dangerous:[239,68,68] };
  const sc = scoreCol[result.score_label]||[120,120,140];
  const riskCol = { high:[210,40,40], medium:[190,130,0], low:[30,140,80] };

  const nl = (h=5) => { y+=h; if(y>272){ doc.addPage(); y=20; }};
  const txt = (text, size=11, bold=false, color=[40,40,55], maxW=CW) => {
    doc.setFontSize(size); doc.setFont("helvetica", bold?"bold":"normal"); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text||""), maxW);
    if(y + lines.length*(size*0.38+1) > 272){ doc.addPage(); y=20; }
    doc.text(lines, M, y);
    y += lines.length*(size*0.38+1.5);
  };
  const section = (label) => {
    nl(5);
    doc.setFillColor(240,237,255); doc.roundedRect(M-3, y-5, CW+6, 11, 2, 2, "F");
    txt(label, 11, true, [70,50,170]);
    nl(3);
  };

  // Cover
  doc.setFillColor(9,9,20); doc.rect(0,0,W,42,"F");
  doc.setFillColor(...sc); doc.rect(0,38,W,4,"F");
  // Logo area
  doc.setFillColor(120,60,220); doc.roundedRect(M, 8, 24, 24, 4, 4, "F");
  doc.setFontSize(16); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("CV", M+6, 23);
  doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("Contrivox", M+28, 23);
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(180,160,255);
  doc.text(t.app_tagline, M+28, 31);
  // Score top right
  const scoreStr = `${result.score}/100 — ${t.score_label_map?.[result.score_label]||result.score_label}`;
  doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(...sc);
  doc.text(scoreStr, W-M, 20, { align:"right" });
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(160,150,200);
  doc.text(result.contract_type||"", W-M, 28, { align:"right" });

  y = 54;

  // Summary
  section(t.results_title);
  txt(result.summary, 10.5, false, [50,50,65]);
  nl(2);
  if(result.parties?.length) txt(`${t.parties}: ${result.parties.join(" · ")}`, 9, false, [110,100,130]);

  // Score box
  nl(6);
  doc.setFillColor(245,243,255); doc.roundedRect(M-3, y-4, CW+6, 26, 3, 3, "F");
  txt(t.score_why, 9, true, [90,70,170]);
  txt(result.score_reasoning, 10, false, [50,50,65]);
  nl(3);

  // Recommendation
  section(t.overall_rec);
  txt(result.overall_recommendation, 10.5, false, [50,50,65]);

  // Key clauses
  section(t.tab_clauses);
  (result.key_clauses||[]).forEach((c,i) => {
    if(y>258){ doc.addPage(); y=20; }
    const rc = riskCol[c.risk_level]||[100,100,110];
    const badge = `[${(c.risk_level||"").toUpperCase()}]`;
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...rc);
    doc.text(`${i+1}. ${badge}`, M, y);
    doc.setTextColor(30,30,45);
    const titleLines = doc.splitTextToSize(c.title||"", CW-20);
    doc.text(titleLines, M+18, y);
    y += Math.max(5, titleLines.length*4);
    txt(c.plain_english, 9.5, false, [65,65,80]);
    if(c.risk_note){ txt(`⚠ ${c.risk_note}`, 9, false, [180,55,55]); }
    nl(3);
  });

  // Red flags
  section(t.tab_flags);
  (result.red_flags||[]).forEach((f,i) => {
    if(y>258){ doc.addPage(); y=20; }
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(195,35,35);
    const issueLines = doc.splitTextToSize(`${i+1}. ${f.issue||""}`, CW);
    doc.text(issueLines, M, y); y += issueLines.length*4.5;
    txt(f.why_it_matters, 9.5, false, [65,65,80]);
    if(f.challengeable && f.challenge){
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(75,65,175);
      doc.text(`${t.suggested}:`, M, y); y+=4;
      txt(f.challenge, 9, false, [75,65,175]);
    }
    nl(4);
  });

  // Missing
  if(result.missing_protections?.length){
    section(t.tab_missing);
    result.missing_protections.forEach(m => { txt(`• ${m}`, 9.5, false, [65,65,80]); nl(1); });
  }

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(240,237,255); doc.rect(0,284,W,13,"F");
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(110,100,140);
    const disc = doc.splitTextToSize(result.disclaimer||t.disclaimer, CW);
    doc.text(disc[0]||"", M, 290);
    doc.setFontSize(8); doc.setTextColor(140,130,170);
    doc.text(`${i} / ${pages}`, W-M, 290, { align:"right" });
  }

  return doc.output("datauristring");
}

// ─── WhatsApp send ────────────────────────────────────────────────────────────
function openWhatsApp(phone, result, t) {
  const num = phone.replace(/\D/g,"");
  const score_translated = t.score_label_map?.[result.score_label] || result.score_label;
  const msg = `📋 *${t.app_name} — ${t.results_title}*\n\n` +
    `📄 ${result.contract_type}\n` +
    `⚖️ ${t.score_lbl}: *${result.score}/100 — ${score_translated}*\n\n` +
    `💡 ${result.overall_recommendation}\n\n` +
    `🔴 ${t.tab_flags}: ${result.red_flags?.length||0}\n` +
    `📌 ${t.tab_clauses}: ${result.key_clauses?.length||0}\n\n` +
    `_${t.disclaimer}_`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ─── Auto email send ──────────────────────────────────────────────────────────
// In production: POST to your /api/send-report { email, analysis, pdfBase64 }
// using SendGrid / Resend / AWS SES to send a branded HTML email with PDF attached.
// This demo opens mailto as a fallback so the flow is visible without a backend.
function autoSendEmail(email, result, t) {
  try {
    const subject = encodeURIComponent(`Contrivox — ${result.contract_type}`);
    const score_label = t.score_label_map?.[result.score_label] || result.score_label;
    const body = encodeURIComponent(
      `${t.results_title}\n` +
      `${"─".repeat(40)}\n\n` +
      `${t.contract_type}: ${result.contract_type}\n` +
      `${t.score_lbl}: ${result.score}/100 — ${score_label}\n\n` +
      `${t.score_why}:\n${result.score_reasoning}\n\n` +
      `${t.overall_rec}:\n${result.overall_recommendation}\n\n` +
      `${t.tab_flags}:\n` +
      (result.red_flags||[]).map((f,i)=>`${i+1}. ${f.issue}\n   ${f.why_it_matters}`).join("\n\n") +
      `\n\n${t.tab_missing}:\n` +
      (result.missing_protections||[]).map((m,i)=>`${i+1}. ${m}`).join("\n") +
      `\n\n${result.disclaimer}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  } catch(e) {
    console.error("Email send error:", e);
  }
}


const getAccount = () => { try{ return JSON.parse(localStorage.getItem("cvx_acc")||"null"); }catch{ return null; }};
const saveAccount = a => localStorage.setItem("cvx_acc", JSON.stringify(a));
const getHistory = () => { try{ return JSON.parse(localStorage.getItem("cvx_hist")||"[]"); }catch{ return []; }};
const pushHistory = entry => {
  const h = getHistory(); h.unshift(entry);
  localStorage.setItem("cvx_hist", JSON.stringify(h.slice(0,25)));
};

// ─── Paywall limits ───────────────────────────────────────────────────────────
const CLAUSE_PREVIEW  = 2;
const FLAG_PREVIEW    = 1;
const MISSING_PREVIEW = 2;

// ─── UI components ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#07070f",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  accent: "#8b5cf6",
  accentGrad: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  danger: "#ef4444",
  text: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.42)",
  faint: "rgba(255,255,255,0.16)",
};

function ContrivoxLogo({ size=22 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <svg width={size*1.4} height={size*1.4} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="9" fill="url(#lg)"/>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient></defs>
        <path d="M10 12h16M10 18h10M10 24h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="26" cy="24" r="4" fill="#ef4444"/>
        <path d="M24.5 24l1 1 2-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily:"'Fraunces',serif", fontSize:size, color:"white", letterSpacing:"-0.02em", fontWeight:600 }}>Contrivox</span>
    </div>
  );
}

function ScoreRing({ score, label, t }) {
  const r=46, c=2*Math.PI*r, dash=(score/100)*c;
  const col = score>=70?"#22c55e":score>=50?"#eab308":score>=30?"#f97316":"#ef4444";
  const translatedLabel = t.score_label_map?.[label] || label;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
        <circle cx="58" cy="58" r={r} fill="none" stroke={col} strokeWidth="9"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 58 58)"
          style={{ transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="58" y="52" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="'Fraunces',serif">{score}</text>
        <text x="58" y="70" textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="11" fontFamily="'DM Sans',sans-serif">/100</text>
      </svg>
      <span style={{ fontSize:11, fontWeight:700, color:col, letterSpacing:"0.09em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{translatedLabel}</span>
    </div>
  );
}

function Badge({ level, t }) {
  const m = {
    high: { bg:"rgba(239,68,68,0.14)",   c:"#f87171", l:t.risk_high },
    medium:{ bg:"rgba(234,179,8,0.13)",   c:"#fbbf24", l:t.risk_med  },
    low:  { bg:"rgba(34,197,94,0.12)",    c:"#4ade80", l:t.risk_low  },
  };
  const s = m[level]||m.low;
  return <span style={{ background:s.bg, color:s.c, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{s.l}</span>;
}

function ClauseCard({ clause, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.035)", border:`0.5px solid ${COLORS.border}`, borderRadius:10, marginBottom:7, overflow:"hidden" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", cursor:"pointer", gap:9, background:"none", border:"none", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <Badge level={clause.risk_level} t={t}/>
          <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{clause.title}</span>
        </div>
        <span style={{ color:COLORS.faint, fontSize:18, flexShrink:0 }}>{open?"−":"+"}</span>
      </button>
      {open && (
        <div style={{ padding:"0 14px 13px", borderTop:`0.5px solid rgba(255,255,255,0.05)` }}>
          <p style={{ margin:"10px 0 0", fontSize:13, lineHeight:1.72, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{clause.plain_english}</p>
          {clause.risk_note && (
            <div style={{ marginTop:8, padding:"8px 11px", background:"rgba(239,68,68,0.07)", borderLeft:"2px solid rgba(239,68,68,0.35)", borderRadius:"0 6px 6px 0" }}>
              <p style={{ margin:0, fontSize:12, color:"#f87171", fontFamily:"'DM Sans',sans-serif" }}>{clause.risk_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlagCard({ flag, t }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ background:"rgba(239,68,68,0.04)", border:"0.5px solid rgba(239,68,68,0.16)", borderRadius:10, padding:"13px 14px", marginBottom:7 }}>
      <p style={{ margin:"0 0 5px", fontSize:13, fontWeight:600, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>{flag.issue}</p>
      <p style={{ margin:0, fontSize:12.5, color:COLORS.muted, lineHeight:1.68, fontFamily:"'DM Sans',sans-serif" }}>{flag.why_it_matters}</p>
      {flag.challengeable ? (
        <>
          <button onClick={()=>{ const next=!show; setShow(next); if(next) Analytics.challengeViewed(flag.issue); }} style={{ marginTop:10, padding:"5px 12px", fontSize:11, fontWeight:700, background:show?"rgba(99,102,241,0.22)":"rgba(99,102,241,0.1)", color:"#a5b4fc", border:"0.5px solid rgba(99,102,241,0.22)", borderRadius:7, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}>
            {show ? t.challenge_hide : t.challenge_btn}
          </button>
          {show && (
            <div style={{ marginTop:9, padding:"11px 13px", background:"rgba(99,102,241,0.08)", border:"0.5px solid rgba(99,102,241,0.18)", borderRadius:9 }}>
              <p style={{ margin:"0 0 5px", fontSize:10, fontWeight:700, color:"#818cf8", letterSpacing:"0.09em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{t.suggested}</p>
              <p style={{ margin:0, fontSize:12.5, color:"rgba(200,190,255,0.85)", lineHeight:1.68, fontFamily:"'DM Sans',sans-serif" }}>{flag.challenge}</p>
            </div>
          )}
        </>
      ) : (
        <span style={{ display:"inline-block", marginTop:8, fontSize:10, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.not_negotiable}</span>
      )}
    </div>
  );
}

function PaywallOverlay({ t, onUnlock }) {
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, top:"22%", background:"linear-gradient(to bottom, rgba(7,7,15,0) 0%, rgba(7,7,15,0.98) 24%)", borderRadius:"0 0 14px 14px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", paddingBottom:26, zIndex:10 }}>
      <div style={{ textAlign:"center", padding:"0 20px" }}>
        <p style={{ fontSize:16.5, fontWeight:600, color:"white", margin:"0 0 7px", fontFamily:"'Fraunces',serif" }}>{t.blur_title}</p>
        <p style={{ fontSize:12.5, color:COLORS.muted, maxWidth:280, margin:"0 auto 16px", lineHeight:1.64, fontFamily:"'DM Sans',sans-serif" }}>{t.blur_sub}</p>
        <button onClick={onUnlock} style={{ padding:"13px 28px", fontSize:14.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 28px rgba(99,102,241,0.5)", letterSpacing:"0.01em", display:"block", width:"100%", maxWidth:280, margin:"0 auto" }}>
          {t.unlock_btn}
        </button>
        <p style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans',sans-serif" }}>{t.unlock_sub}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginTop:10 }}>
          <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.2)", fontFamily:"'DM Sans',sans-serif" }}>🔒 Secure payment</span>
          <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.2)", fontFamily:"'DM Sans',sans-serif" }}>⚡ Instant access</span>
        </div>
      </div>
    </div>
  );
}

function DeliveryPanel({ result, t, pdfUri }) {
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [emailSt, setEmailSt] = useState("idle");
  const [waSt, setWaSt] = useState("idle");

  const inp = { background:"rgba(255,255,255,0.055)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"10px 13px", color:"white", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", transition:"border-color .15s" };
  const btn = (grad, disabled) => ({ padding:"10px 16px", fontSize:12.5, fontWeight:700, background:disabled?"rgba(255,255,255,0.05)":grad, color:disabled?COLORS.faint:"white", border:"none", borderRadius:9, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s" });

  const doEmail = () => {
    if(!email||emailSt==="sending") return;
    setEmailSt("sending");
    Analytics.reportSentEmail();
    setTimeout(()=>{
      const sub = encodeURIComponent(`Contrivox — ${result.contract_type}`);
      const body = encodeURIComponent(`${t.rec_title}:\n${result.overall_recommendation}\n\n${t.score_lbl}: ${result.score}/100 — ${result.score_label_map?.[result.score_label]||result.score_label}\n\n${t.disclaimer}`);
      window.open(`mailto:${email}?subject=${sub}&body=${body}`, "_blank");
      setEmailSt("sent");
    }, 800);
  };

  const doWa = () => {
    if(!wa||waSt==="sending") return;
    setWaSt("sending");
    Analytics.reportSentWhatsapp();
    setTimeout(()=>{ openWhatsApp(wa, result, t); setWaSt("sent"); }, 500);
  };

  return (
    <div style={{ background:"rgba(99,102,241,0.05)", border:"0.5px solid rgba(99,102,241,0.2)", borderRadius:16, padding:"20px", marginBottom:14 }}>
      <p style={{ fontSize:14, fontWeight:600, color:"white", margin:"0 0 3px", fontFamily:"'Fraunces',serif" }}>{t.deliver_title}</p>
      <p style={{ fontSize:12, color:COLORS.muted, margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>{t.deliver_sub}</p>
      <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
        <input style={inp} type="email" placeholder={t.email_placeholder} value={email} onChange={e=>setEmail(e.target.value)}/>
        <button style={btn(COLORS.accentGrad, !email)} onClick={doEmail} disabled={!email}>
          {emailSt==="sending"?t.sending:emailSt==="sent"?t.sent_email:t.send_email}
        </button>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <input style={inp} type="tel" placeholder={t.whatsapp_placeholder} value={wa} onChange={e=>setWa(e.target.value)}/>
        <button style={btn("linear-gradient(135deg,#16a34a,#15803d)", !wa)} onClick={doWa} disabled={!wa}>
          {waSt==="sending"?t.sending:waSt==="sent"?t.sent_wa:t.send_wa}
        </button>
      </div>
      {pdfUri && (
        <a href={pdfUri} download="Contrivox-Report.pdf" onClick={()=>Analytics.pdfDownloaded()} style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:13, fontSize:12, color:"rgba(167,139,250,0.75)", fontFamily:"'DM Sans',sans-serif", textDecoration:"underline" }}>
          {t.download_pdf}
        </a>
      )}
    </div>
  );
}

function AuthModal({ t, onClose, onAuth }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const inp = { display:"block", width:"100%", background:"rgba(255,255,255,0.06)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"11px 13px", color:"white", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:10 };
  const submit = () => {
    if(!email) return;
    const acc = { name:name||email.split("@")[0], email, createdAt:Date.now() };
    saveAccount(acc); onAuth(acc); onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"30px 26px", width:"100%", maxWidth:380, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:18, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
        <ContrivoxLogo size={18}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"white", margin:"16px 0 20px" }}>{t.signin_title}</h2>
        {mode==="signup" && <input style={inp} placeholder={t.account_name} value={name} onChange={e=>setName(e.target.value)}/>}
        <input style={inp} type="email" placeholder={t.signin_email} value={email} onChange={e=>setEmail(e.target.value)}/>
        <input style={inp} type="password" placeholder={t.signin_pw} value={pw} onChange={e=>setPw(e.target.value)}/>
        <button onClick={submit} style={{ width:"100%", padding:"12px", fontSize:14, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>
          {mode==="signin"?t.signin_btn:t.signup_btn}
        </button>
        <button onClick={()=>setMode(m=>m==="signin"?"signup":"signin")} style={{ width:"100%", background:"none", border:"none", color:"rgba(167,139,250,0.65)", cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
          {mode==="signin"?t.signup_btn:t.signin_btn}
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ t, account, onClose, onLoad }) {
  const history = getHistory();
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:1000, display:"flex", alignItems:"stretch", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f", borderLeft:`0.5px solid ${COLORS.border}`, padding:"26px 22px", width:"100%", maxWidth:420, overflowY:"auto", position:"relative", display:"flex", flexDirection:"column", gap:0 }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:20, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22 }}>×</button>
        <ContrivoxLogo size={16}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"white", margin:"16px 0 4px" }}>{t.account_title}</h2>
        <p style={{ fontSize:11, color:COLORS.muted, marginBottom:22, fontFamily:"'DM Sans',sans-serif" }}>{account?.email}</p>
        {history.length===0 ? (
          <p style={{ fontSize:13, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{t.account_empty}</p>
        ) : history.map((item, i) => {
          const scCol = {Fair:"#22c55e",Acceptable:"#84cc16",Concerning:"#eab308",Unfair:"#f97316",Dangerous:"#ef4444"};
          const sc2 = scCol[item.score_label]||"#aaa";
          return (
            <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:`0.5px solid ${COLORS.border}`, borderRadius:11, padding:"13px 15px", marginBottom:9, display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.contract_type}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                  <span style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{t.account_date}: {new Date(item.savedAt).toLocaleDateString()}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:sc2, fontFamily:"'DM Sans',sans-serif" }}>{item.score}/100</span>
                </div>
              </div>
              <button onClick={()=>{ onLoad(item); onClose(); }} style={{ padding:"6px 13px", fontSize:11.5, fontWeight:600, background:"rgba(139,92,246,0.14)", color:"#a78bfa", border:"0.5px solid rgba(139,92,246,0.22)", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0 }}>{t.account_view}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:`0.5px solid ${COLORS.border}`, padding:"17px 0" }}>
      <button onClick={()=>{ const next=!open; setOpen(next); if(next) Analytics.faqOpened(q); }} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0, gap:12 }}>
        <span style={{ fontSize:14, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ color:COLORS.faint, fontSize:20, flexShrink:0, transition:"transform .2s", transform:open?"rotate(45deg)":"rotate(0)" }}>+</span>
      </button>
      {open && <p style={{ marginTop:10, fontSize:13, color:COLORS.muted, lineHeight:1.72, fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Contrivox() {
  const [outLang, setOutLang]       = useState("en");
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [loadMsg, setLoadMsg]       = useState("");
  const [result, setResult]         = useState(null);
  const [tab, setTab]               = useState("clauses");
  const [error, setError]           = useState(null);
  const [unlocked, setUnlocked]     = useState(false);
  const [pdfUri, setPdfUri]         = useState(null);
  const [account, setAccount]       = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [showHist, setShowHist]     = useState(false);
  const [sessionId, setSessionId]         = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const fileRef    = useRef();
  const resultsRef = useRef();
  const t = T.en;

  useEffect(()=>{
    setAccount(getAccount());
  },[]);

  // Build PDF whenever result is ready (jsPDF loads on demand via dynamic import)
  useEffect(()=>{
    if(!result) return;
    generatePDF(result,t).then(setPdfUri).catch(()=>{});
  },[result]);

  // Fire paywall_shown once per result when paywall is visible
  useEffect(()=>{
    if(!result||unlocked) return;
    const hidden =
      (result.key_clauses?.length ?? 0) - CLAUSE_PREVIEW +
      (result.red_flags?.length ?? 0) - FLAG_PREVIEW +
      (result.missing_protections?.length ?? 0) - MISSING_PREVIEW;
    if(hidden > 0) Analytics.paywallShown({ tab, items_hidden: hidden });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[result]);

  const handleFile = useCallback((f)=>{
    if(!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if(!["pdf","png","jpg","jpeg","gif","webp","txt","doc","docx"].includes(ext)){ setError("Unsupported file type."); return; }
    if(f.size>20*1024*1024){ setError("File too large. Max 20MB."); return; }
    setFile(f); setError(null); setResult(null); setUnlocked(false); setPdfUri(null);
    Analytics.contractUploaded({ file_type: ext, file_size_kb: Math.round(f.size / 1024) });
  },[]);

  const onDrop = useCallback((e)=>{ e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); },[handleFile]);

  const analyse = async () => {
    if(!file) return;

    setLoading(true); setError(null); setResult(null); setUnlocked(false); setPdfUri(null); setSessionId(null);
    setLoadMsg("Uploading your contract…");
    try {
      const payload = await extractFile(file);
      Analytics.analysisStarted({
        file_type: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
      });

      const res = await fetch("/api/contract/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData:  payload.type !== "text" ? payload.data  : null,
          fileText:  payload.type === "text"  ? payload.text : null,
          fileType:  payload.type,
          mediaType: payload.mediaType ?? null,
          fileName:  file.name,
          langCode:  outLang,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const { sessionId: sid, dummyAnalysis } = await res.json();

      setSessionId(sid);
      setResult(dummyAnalysis);
      setTab("clauses");
      Analytics.analysisCompleted({
        score:          dummyAnalysis.score,
        score_label:    dummyAnalysis.score_label,
        contract_type:  dummyAnalysis.contract_type,
        clause_count:   dummyAnalysis.key_clauses?.length ?? 0,
        red_flag_count: dummyAnalysis.red_flags?.length ?? 0,
        missing_count:  dummyAnalysis.missing_protections?.length ?? 0,
      });
      if(account) pushHistory({ ...dummyAnalysis, savedAt:Date.now(), fileName:file.name });
      setTimeout(()=>resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }),250);
    } catch(e) {
      setError("Could not process your contract. Please try again.");
      Analytics.analysisErrored(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (unlockLoading) return;
    Analytics.unlockClicked();
    setUnlockLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter", sessionId }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch(e) {
      setError("Could not start checkout. Please try again.");
      setUnlockLoading(false);
    }
  };

  function renderPaywalled(items, limit, renderFn) {
    if(!items?.length) return <p style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:"20px 0", fontFamily:"'DM Sans',sans-serif" }}>{t.none_found}</p>;
    const preview = items.slice(0, limit);
    const locked  = items.slice(limit);
    return (
      <div>
        {preview.map((item,i) => renderFn(item,i))}
        {!unlocked && locked.length > 0 && (
          <div style={{ position:"relative", minHeight:220 }}>
            <div style={{ filter:"blur(5px)", pointerEvents:"none", userSelect:"none", opacity:0.5 }}>
              {locked.map((item,i) => renderFn(item, i+limit))}
            </div>
            <PaywallOverlay t={t} onUnlock={handleUnlock}/>
          </div>
        )}
        {unlocked && locked.map((item,i) => renderFn(item, i+limit))}
      </div>
    );
  }

  const tabBtn = (k, label) => (
    <button key={k} onClick={()=>{ if(k!==tab){ Analytics.tabSwitched({ from:tab, to:k }); } setTab(k); }} style={{ flex:1, padding:"7px 6px", fontSize:12, fontWeight:500, cursor:"pointer", borderRadius:9, border:"none", fontFamily:"'DM Sans',sans-serif", background:tab===k?"rgba(255,255,255,0.1)":"transparent", color:tab===k?COLORS.text:COLORS.muted, transition:"all .15s" }}>{label}</button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${COLORS.bg};font-family:'DM Sans',sans-serif; -webkit-text-size-adjust:100%;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
        select,input,button{font-family:'DM Sans',sans-serif;}
        select option{background:#1a1a2e;color:white;}
        input::placeholder{color:rgba(255,255,255,0.26);}
        input:focus{border-color:rgba(139,92,246,0.45)!important;outline:none;}
        /* Mobile tap improvements */
        button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        @media(max-width:640px){
          nav{padding:0 14px!important;}
          section{padding-left:14px!important;padding-right:14px!important;}
          .hero-stats{grid-template-columns:1fr 1fr!important;}
          .fear-grid{grid-template-columns:1fr!important;}
          .how-grid{grid-template-columns:1fr!important;}
          .test-grid{grid-template-columns:1fr!important;}
        }
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.2)}50%{box-shadow:0 0 35px rgba(139,92,246,0.45)}}
        .fear-card{transition:border-color .2s,transform .2s;}
        .fear-card:hover{border-color:rgba(239,68,68,0.32)!important;transform:translateY(-2px);}
        .how-card{transition:background .2s,transform .2s;}
        .how-card:hover{background:rgba(255,255,255,0.05)!important;transform:translateY(-2px);}
        .nav-link{transition:color .15s;}
        .nav-link:hover{color:white!important;}
      `}</style>

      {showAuth && <AuthModal t={t} onClose={()=>setShowAuth(false)} onAuth={acc=>{ setAccount(acc); Analytics.signUpCompleted(acc.email); }}/>}
      {showHist && <HistoryPanel t={t} account={account} onClose={()=>setShowHist(false)} onLoad={r=>{ setResult(r); setUnlocked(true); setTab("clauses"); setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth"}),200); }}/>}

      <div style={{ minHeight:"100vh", background:COLORS.bg, backgroundImage:"radial-gradient(ellipse 65% 38% at 50% -4%, rgba(109,40,217,0.22) 0%, transparent 55%), radial-gradient(ellipse 35% 25% at 90% 90%, rgba(239,68,68,0.07) 0%, transparent 50%)" }}>

        {/* NAV */}
        <nav style={{ position:"sticky", top:0, zIndex:90, backdropFilter:"blur(18px)", background:"rgba(7,7,15,0.84)", borderBottom:`0.5px solid ${COLORS.border}`, padding:"0 20px" }}>
          <div style={{ maxWidth:920, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
            <ContrivoxLogo size={19}/>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {account ? (
                <>
                  <button onClick={()=>setShowHist(true)} className="nav-link" style={{ padding:"6px 13px", fontSize:12, fontWeight:500, background:"rgba(255,255,255,0.06)", color:COLORS.muted, border:`0.5px solid ${COLORS.border}`, borderRadius:8, cursor:"pointer" }}>{t.nav_history}</button>
                  <button onClick={()=>{ Analytics.signedOut(); saveAccount(null); setAccount(null); }} className="nav-link" style={{ padding:"6px 10px", fontSize:12, background:"none", color:"rgba(255,255,255,0.3)", border:"none", cursor:"pointer" }}>{t.signout}</button>
                </>
              ) : (
                <>
                  <button onClick={()=>{ Analytics.signInClicked(); setShowAuth(true); }} className="nav-link" style={{ padding:"6px 13px", fontSize:12, fontWeight:500, background:"rgba(255,255,255,0.06)", color:COLORS.muted, border:`0.5px solid ${COLORS.border}`, borderRadius:8, cursor:"pointer" }}>{t.nav_signin}</button>
                  <button onClick={()=>{ Analytics.ctaClicked("nav"); document.getElementById("upload-sec")?.scrollIntoView({behavior:"smooth"}); }} style={{ padding:"7px 16px", fontSize:12.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:8, cursor:"pointer", animation:"glow 3s infinite", letterSpacing:"0.01em" }}>{t.nav_cta}</button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding:"88px 20px 64px", textAlign:"center" }}>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:22, padding:"4px 14px", background:"rgba(239,68,68,0.09)", borderRadius:20, border:"0.5px solid rgba(239,68,68,0.2)" }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:COLORS.danger, animation:"pulse 2s infinite", flexShrink:0 }}/>
              <span style={{ fontSize:10.5, fontWeight:700, color:"#f87171", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_badge}</span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(36px,7vw,66px)", color:"white", lineHeight:1.07, marginBottom:20, fontWeight:600 }}>
              {t.hero_h1a}<br/>
              <em style={{ color:COLORS.danger, fontStyle:"italic" }}>{t.hero_h1b}</em>
            </h1>
            <p style={{ fontSize:"clamp(14.5px,1.9vw,17px)", color:COLORS.muted, lineHeight:1.76, maxWidth:500, margin:"0 auto 18px", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_sub}</p>
            {/* Micro social proof */}
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.28)", marginBottom:36, fontFamily:"'DM Sans',sans-serif" }}>
              Used by <span style={{ color:"rgba(255,255,255,0.5)", fontWeight:600 }}>12,400+</span> professionals to review contracts before signing
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, maxWidth:520, margin:"0 auto" }}>
              {[[t.stat1v,t.stat1l],[t.stat2v,t.stat2l],[t.stat3v,t.stat3l]].map(([v,l],i)=>(
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:12, padding:"13px 10px" }}>
                  <div style={{ fontSize:"clamp(19px,3.2vw,28px)", fontWeight:600, color:COLORS.danger, fontFamily:"'Fraunces',serif", marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:"clamp(9px,1vw,10.5px)", color:COLORS.muted, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEAR SECTION */}
        <section style={{ padding:"0 20px 72px" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:12 }}>
            {[[t.fear1t,t.fear1b,"⚠️"],[t.fear2t,t.fear2b,"🔗"],[t.fear3t,t.fear3b,"🔄"]].map(([title,body,icon],i)=>(
              <div key={i} className="fear-card" style={{ background:"rgba(239,68,68,0.04)", border:"0.5px solid rgba(239,68,68,0.13)", borderRadius:14, padding:"22px 20px" }}>
                <div style={{ fontSize:24, marginBottom:12 }}>{icon}</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17.5, color:"white", marginBottom:10, lineHeight:1.2, fontWeight:600 }}>{title}</h3>
                <p style={{ fontSize:13, color:COLORS.muted, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST STRIP */}
        <section style={{ padding:"0 20px 52px" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", textAlign:"center", letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>{t.trust_label}</p>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"8px 14px" }}>
              {t.trust_items.map((item,i)=>(
                <span key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Sans',sans-serif", padding:"5px 14px", background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.07)", borderRadius:20 }}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* UPLOAD + CONTACT COLLECTION */}
        <section id="upload-sec" style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:660, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"26px 24px", backdropFilter:"blur(12px)" }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:"white", marginBottom:4, fontWeight:600 }}>{t.upload_title}</h2>
              <p style={{ fontSize:12, color:COLORS.muted, margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>{t.upload_formats} · Any language</p>

              {/* ── MOBILE-FRIENDLY FILE PICKER ── */}
              {/* Hidden real input — always present so it can be triggered programmatically */}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx"
                onChange={e=>handleFile(e.target.files[0])}
                style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}
              />

              {file ? (
                /* File chosen — show file card */
                <div style={{ background:"rgba(34,197,94,0.06)", border:"0.5px solid rgba(34,197,94,0.3)", borderRadius:13, padding:"18px 16px", display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                  <div style={{ fontSize:32, flexShrink:0 }}>📄</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#4ade80", margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                    <p style={{ fontSize:11, color:COLORS.muted, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{(file.size/1024).toFixed(0)} KB · {file.name.split(".").pop().toUpperCase()}</p>
                  </div>
                  <button
                    onClick={()=>{ setFile(null); setResult(null); setAutoSentTo(null); }}
                    style={{ background:"rgba(239,68,68,0.12)", border:"0.5px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}
                  >✕</button>
                </div>
              ) : (
                /* Drop / tap zone — whole area is clickable, large touch target */
                <div
                  onDragOver={e=>{e.preventDefault();setDragging(true);}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={onDrop}
                  onClick={()=>fileRef.current.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e=>e.key==="Enter"&&fileRef.current.click()}
                  aria-label={t.upload_drop}
                  style={{
                    border:`1.5px dashed ${dragging?"rgba(139,92,246,0.7)":COLORS.faint}`,
                    borderRadius:13, padding:"36px 20px", textAlign:"center",
                    cursor:"pointer", background:dragging?"rgba(139,92,246,0.05)":"rgba(255,255,255,0.015)",
                    transition:"all .2s", marginBottom:18, WebkitTapHighlightColor:"transparent",
                    touchAction:"manipulation", userSelect:"none",
                  }}
                >
                  <div style={{ width:52, height:52, borderRadius:13, background:"rgba(139,92,246,0.12)", border:"0.5px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 13px", fontSize:22 }}>📄</div>
                  <p style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.82)", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>{t.upload_drop}</p>
                  <p style={{ fontSize:11.5, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>{t.upload_or}</p>
                  <span style={{ display:"inline-block", padding:"9px 22px", fontSize:13, fontWeight:600, background:COLORS.accentGrad, color:"white", borderRadius:9, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 12px rgba(99,102,241,0.35)", pointerEvents:"none" }}>
                    Choose file
                  </span>
                </div>
              )}

              {error && (
                <div style={{ marginBottom:12, padding:"9px 13px", background:"rgba(239,68,68,0.09)", borderRadius:9, border:"0.5px solid rgba(239,68,68,0.2)" }}>
                  <p style={{ fontSize:12, color:"#f87171", fontFamily:"'DM Sans',sans-serif", margin:0 }}>{error}</p>
                </div>
              )}

              {!account && (
                <p style={{ fontSize:12, color:COLORS.faint, textAlign:"center", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>
                  {t.account_signin_prompt}{" "}
                  <button onClick={()=>setShowAuth(true)} style={{ background:"none", border:"none", color:"rgba(167,139,250,0.7)", cursor:"pointer", fontSize:12, textDecoration:"underline", fontFamily:"'DM Sans',sans-serif" }}>{t.nav_signin}</button>
                </p>
              )}

              <button
                onClick={analyse}
                disabled={!file||loading}
                style={{ width:"100%", padding:"15px", fontSize:15, fontWeight:700, borderRadius:12, border:"none", cursor:file&&!loading?"pointer":"not-allowed", background:file&&!loading?COLORS.accentGrad:"rgba(255,255,255,0.05)", color:file&&!loading?"white":"rgba(255,255,255,0.18)", transition:"all .2s", letterSpacing:"0.02em", touchAction:"manipulation", WebkitTapHighlightColor:"transparent" }}
              >
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/>
                    {loadMsg}
                  </span>
                ) : t.analyse_btn}
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS */}
        {result && (
          <section ref={resultsRef} style={{ padding:"0 20px 80px", animation:"fadeUp .5s ease" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>

              {/* Score card */}
              <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"22px 22px", marginBottom:12, display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
                <ScoreRing score={result.score} label={result.score_label} t={t}/>
                <div style={{ flex:1, minWidth:190 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.9)", background:"rgba(167,139,250,0.1)", padding:"2px 10px", borderRadius:20, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{result.contract_type}</span>
                    {result.parties?.slice(0,2).map((p,i)=>(
                      <span key={i} style={{ fontSize:11, color:COLORS.muted, background:"rgba(255,255,255,0.05)", padding:"2px 10px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>{p}</span>
                    ))}
                  </div>
                  <p style={{ fontSize:13, lineHeight:1.72, color:COLORS.muted, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{result.summary}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontStyle:"italic", fontFamily:"'DM Sans',sans-serif" }}>{result.score_reasoning}</p>
                </div>
              </div>

              {/* Recommendation */}
              <div style={{ background:"rgba(99,102,241,0.07)", border:"0.5px solid rgba(99,102,241,0.2)", borderRadius:13, padding:"15px 17px", marginBottom:12, display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#818cf8", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{t.rec_title}</p>
                  <p style={{ fontSize:13, lineHeight:1.72, color:"rgba(200,195,255,0.85)", fontFamily:"'DM Sans',sans-serif" }}>{result.overall_recommendation}</p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", gap:3, marginBottom:12, background:"rgba(255,255,255,0.024)", borderRadius:11, padding:"3px", border:`0.5px solid rgba(255,255,255,0.06)` }}>
                {tabBtn("clauses", `${t.tab_clauses} (${result.key_clauses?.length||0})`)}
                {tabBtn("flags",   `${t.tab_flags} (${result.red_flags?.length||0})`)}
                {tabBtn("missing", `${t.tab_missing} (${result.missing_protections?.length||0})`)}
              </div>

              {/* Tab content */}
              <div style={{ background:"rgba(255,255,255,0.018)", border:`0.5px solid rgba(255,255,255,0.06)`, borderRadius:14, padding:16, position:"relative", overflow:"hidden" }}>
                {!unlocked && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:13 }}>
                    <span style={{ background:"rgba(239,68,68,0.13)", color:"#f87171", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, letterSpacing:"0.05em", fontFamily:"'DM Sans',sans-serif" }}>{t.preview_only}</span>
                    <span style={{ fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>
                      {t.showing} {
                        tab==="clauses"?Math.min(CLAUSE_PREVIEW,result.key_clauses?.length||0):
                        tab==="flags"?Math.min(FLAG_PREVIEW,result.red_flags?.length||0):
                        Math.min(MISSING_PREVIEW,result.missing_protections?.length||0)
                      } {t.of} {
                        tab==="clauses"?result.key_clauses?.length:
                        tab==="flags"?result.red_flags?.length:
                        result.missing_protections?.length
                      }
                    </span>
                  </div>
                )}
                {tab==="clauses" && renderPaywalled(result.key_clauses, CLAUSE_PREVIEW,  (c,i) => <ClauseCard key={i} clause={c} t={t}/>)}
                {tab==="flags"   && renderPaywalled(result.red_flags,   FLAG_PREVIEW,    (f,i) => <FlagCard   key={i} flag={f}   t={t}/>)}
                {tab==="missing" && renderPaywalled(result.missing_protections, MISSING_PREVIEW, (m,i) => (
                  <div key={i} style={{ display:"flex", gap:9, padding:"10px 12px", marginBottom:7, background:"rgba(245,158,11,0.05)", border:"0.5px solid rgba(245,158,11,0.15)", borderRadius:9 }}>
                    <span style={{ color:"#fbbf24", flexShrink:0 }}>⚠</span>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.68)", lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{m}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"center", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{result.disclaimer}</p>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:860, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:"white", textAlign:"center", marginBottom:8, fontWeight:600 }}>{t.how_title}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, textAlign:"center", marginBottom:40, fontFamily:"'DM Sans',sans-serif" }}>60 seconds from upload to full report.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
              {[["⬆",t.how1t,t.how1b,"01"],["🔍",t.how2t,t.how2b,"02"],["📋",t.how3t,t.how3b,"03"]].map(([icon,title,body,n],i)=>(
                <div key={i} className="how-card" style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"22px 20px", position:"relative" }}>
                  <div style={{ position:"absolute", top:18, right:18, fontSize:11, fontWeight:700, color:"rgba(139,92,246,0.4)", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>{n}</div>
                  <div style={{ fontSize:24, marginBottom:14 }}>{icon}</div>
                  <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17, color:"white", marginBottom:7, lineHeight:1.25, fontWeight:600 }}>{title}</h3>
                  <p style={{ fontSize:12.5, color:COLORS.muted, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding:"72px 20px" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:"white", textAlign:"center", marginBottom:8, fontWeight:600 }}>{t.test_title}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, textAlign:"center", marginBottom:40, fontFamily:"'DM Sans',sans-serif" }}>What people found in their contracts.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:12 }}>
              {[[t.t1n,t.t1r,t.t1t],[t.t2n,t.t2r,t.t2t],[t.t3n,t.t3r,t.t3t]].map(([name,role,text],i)=>(
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"20px 18px", display:"flex", flexDirection:"column" }}>
                  <div style={{ marginBottom:12, color:"#f59e0b", fontSize:12, letterSpacing:"2px" }}>★★★★★</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.74, marginBottom:16, fontStyle:"italic", fontFamily:"'DM Sans',sans-serif", flex:1 }}>"{text}"</p>
                  <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.06)", paddingTop:12 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", margin:"0 0 2px" }}>{name}</p>
                    <p style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", margin:0 }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,38px)", color:"white", textAlign:"center", marginBottom:36, fontWeight:600 }}>{t.faq_title}</h2>
            <FaqItem q={t.faq1q} a={t.faq1a}/>
            <FaqItem q={t.faq2q} a={t.faq2a}/>
            <FaqItem q={t.faq3q} a={t.faq3a}/>
            <FaqItem q={t.faq4q} a={t.faq4a}/>
            <FaqItem q={t.faq5q} a={t.faq5a}/>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:"80px 20px", textAlign:"center", background:"rgba(99,102,241,0.05)", borderTop:"0.5px solid rgba(99,102,241,0.14)" }}>
          <div style={{ maxWidth:520, margin:"0 auto" }}>
            <ContrivoxLogo size={20}/>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(24px,4vw,40px)", color:"white", margin:"20px 0 10px", lineHeight:1.15, fontWeight:600 }}>{t.cta_band}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, marginBottom:28, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
              The analysis is free. The full report is $3.99.<br/>
              <span style={{ color:"rgba(255,255,255,0.38)" }}>No account required. No subscription.</span>
            </p>
            <button onClick={()=>{ Analytics.ctaClicked("cta_band"); document.getElementById("upload-sec")?.scrollIntoView({behavior:"smooth"}); }} style={{ padding:"15px 36px", fontSize:15.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 5px 30px rgba(99,102,241,0.38)", animation:"glow 3s infinite", letterSpacing:"0.01em" }}>
              Analyse My Contract — Free
            </button>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginTop:14, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans',sans-serif" }}>🔒 Private &amp; secure</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans',sans-serif" }}>⚡ Results in 60 seconds</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans',sans-serif" }}>🌍 Any language</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding:"26px 20px", textAlign:"center", borderTop:`0.5px solid ${COLORS.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap", marginBottom:10 }}>
            <ContrivoxLogo size={14}/>
            <span style={{ color:COLORS.faint, fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>·</span>
            <span style={{ fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.footer_copy}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:12, flexWrap:"wrap" }}>
            <a href="/privacy" style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>Privacy Policy</a>
            <a href="/terms" style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>Terms of Service</a>
            <a href="mailto:legal@contrivox.com" style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>Legal</a>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", maxWidth:600, margin:"0 auto", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{t.disclaimer}</p>
        </footer>
      </div>
    </>
  );
}
