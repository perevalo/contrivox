import { useState, useEffect, useRef, useCallback } from "react";
import { Analytics } from "@/lib/analytics";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    app_name: "Contrivox",
    app_tagline: "AI contract analysis. Plain language. Instant.",
    nav_cta: "Check My Contract", nav_signin: "Sign In", nav_history: "My Analyses", signout: "Sign out",
    hero_badge: "See a sample report →",
    hero_h1a: "Your employer, landlord, or client", hero_h1b: "wrote that contract to protect themselves.",
    hero_sub: "Non-competes that ban you from your industry. Arbitration clauses that take away your right to sue. Auto-renewals that charge you for years. Contrivox reads every word — in 60 seconds — so you know exactly what you're agreeing to.",
    hero_social: "Join thousands of professionals who checked before they signed.",
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
    out_lang: "Report language", analyse_btn: "Check My Contract — $9 · 60 seconds",
    analyse_trust: "Secure payment via Stripe. No subscription. Cancel anytime.",
    sample_btn: "See a Sample Report →",
    privacy_note: "Your contract is encrypted in transit, analyzed privately, and never stored after your report is delivered.",
    risk_stats_title: "What's hiding in your contract?",
    preview_scanned: "Contract Scanned",
    preview_pages: "scanned",
    preview_high_risk: "high-risk clauses detected",
    preview_flagged: "clauses flagged for review",
    unlock_btn: "Unlock Full Report — $9",
    unlock_trust: "Secure payment via Stripe · One-time · No subscription",
    contact_title: "Where should we send your full report?",
    contact_sub: "Enter your email and we'll send the complete analysis automatically.",
    contact_email_label: "Email address", contact_email_ph: "your@email.com",
    contact_wa_label: "WhatsApp (optional)", contact_wa_ph: "+1 555 000 0000",
    contact_wa_opt: "Get a WhatsApp summary too",
    contact_privacy: "Your details are never shared. Used only to deliver your Contrivox report.",
    contact_email_required: "We need your email to send the report.",
    contact_email_invalid: "Please enter a valid email address.",
    auto_sent: "✓ Report sent to", auto_sending: "Sending your report…",
    results_title: "Your Contract Report", score_lbl: "Fairness score",
    tab_clauses: "Key Clauses", tab_flags: "Red Flags", tab_missing: "Missing Protections",
    preview_only: "Preview", showing: "showing", of: "of",
    deliver_title: "Get your full report",
    deliver_sub: "Send the complete PDF to your email or WhatsApp",
    email_placeholder: "your@email.com", whatsapp_placeholder: "+1 555 000 0000",
    send_email: "Send to Email", send_wa: "Send via WhatsApp",
    sending: "Sending…", sent_email: "✓ Sent to your email!", sent_wa: "✓ Sent via WhatsApp!",
    send_error: "Could not send. Please try again.",
    download_pdf: "Download PDF",
    rec_title: "Our recommendation", score_why: "Why this score",
    risk_high: "High risk", risk_med: "Medium risk", risk_low: "Low risk",
    challenge_btn: "How to negotiate this →", challenge_hide: "Hide",
    not_negotiable: "Non-negotiable clause", suggested: "Negotiation script",
    none_found: "None identified.",
    disclaimer: "Contrivox is not a law firm and does not provide legal advice. This report is for informational purposes only. Consult a qualified lawyer before signing any contract.",
    how_title: "How it works",
    how1t: "Upload in any format", how1b: "PDF, photo, Word doc, or pasted text — in any language. Upload takes under 10 seconds.",
    how2t: "AI reads every clause", how2b: "Scans for non-competes, arbitration clauses, IP assignment, auto-renewals, indemnification terms, and 40+ other clause types — in 60 seconds.",
    how3t: "Get your plain-language report", how3b: "Your Fairness Score (0–100), every red flag explained in plain English, missing protections identified, and word-for-word negotiation scripts for every problematic clause.",
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
    faq1q: "Is this legal advice?",
    faq1a: "No. Contrivox identifies clauses and explains them in plain English. Always consult a qualified attorney before signing any contract — especially before refusing terms or renegotiating an offer.",
    faq2q: "What file types can I upload?",
    faq2a: "PDF, JPG, PNG, GIF, WEBP, TXT, and DOCX. Works on any contract in any language — the report comes back in English.",
    faq3q: "What do I get for $9?",
    faq3a: "The complete analysis: every clause explained in plain English, all red flags with real-world impact, missing protections listed, word-for-word negotiation scripts, and your full fairness score with reasoning. Instant delivery — one-time payment, no subscription.",
    faq4q: "Is my contract private?",
    faq4a: "Yes. Your document is encrypted in transit, processed privately in memory, and deleted after your report is generated. We never sell or share your contract data. See our privacy policy for full details.",
    faq5q: "How is this different from asking ChatGPT?",
    faq5a: "ChatGPT gives general information about contract clauses. Contrivox is purpose-built for contract analysis — it understands clause-level risk, flags terms that are aggressive compared to industry standards, generates a Fairness Score based on the full document, and provides negotiation scripts tailored to your specific clauses. It's the difference between a general health article and a doctor reading your actual test results.",
    faq6q: "What contract types do you support?",
    faq6a: "Employment agreements, NDAs and non-disclosure agreements, freelance and independent contractor contracts, service agreements, and residential leases. Contract types are detected automatically — just upload.",
    cta_band: "Know exactly what you're signing.",
    cta_urgency: "The average employment dispute costs $18,000. A $9 report takes 60 seconds.",
    cta_trust: "Secure payment via Stripe · No subscription · No account required",
    footer_copy: `© ${new Date().getFullYear()} Contrivox`,
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

// ─── Risk statistics by contract type ────────────────────────────────────────
const RISK_STATS = {
  employment: [
    { stat: "67%", desc: "of employment contracts contain non-competes broader than legally enforceable" },
    { stat: "81%", desc: "include mandatory arbitration clauses that waive your right to sue in court" },
    { stat: "43%", desc: "have IP assignment clauses that may cover your personal projects" },
  ],
  lease: [
    { stat: "72%", desc: "of lease agreements contain auto-renewal clauses with no cap on rent increases" },
    { stat: "58%", desc: "include landlord entry clauses broader than local law requires" },
    { stat: "41%", desc: "have unilateral modification clauses that let landlords change terms mid-lease" },
  ],
  freelance: [
    { stat: "68%", desc: "of freelance contracts claim ownership of all work created during the contract period" },
    { stat: "54%", desc: "contain payment dispute clauses that favor the client over the freelancer" },
    { stat: "39%", desc: "include non-solicitation clauses that limit your future client relationships" },
  ],
  nda: [
    { stat: "61%", desc: "of NDAs have no expiration date or time limit" },
    { stat: "74%", desc: "define confidential information so broadly it covers publicly available information" },
    { stat: "45%", desc: "include unilateral clauses that only protect the company, not the signer" },
  ],
  service: [
    { stat: "63%", desc: "of service agreements contain automatic renewal clauses with short cancellation windows" },
    { stat: "55%", desc: "include liability caps that protect the provider, not the customer" },
    { stat: "48%", desc: "have unilateral price adjustment clauses with no notice requirement" },
  ],
  business: [
    { stat: "71%", desc: "of business contracts include indemnification clauses broader than industry standard" },
    { stat: "59%", desc: "contain intellectual property assignment clauses that exceed what was negotiated verbally" },
    { stat: "44%", desc: "have dispute resolution clauses that require arbitration in a different state or jurisdiction" },
  ],
};

const STAT_TABS = [
  { key: "employment", label: "Employment" },
  { key: "lease",      label: "Lease" },
  { key: "freelance",  label: "Freelance" },
  { key: "nda",        label: "NDAs" },
  { key: "service",    label: "Service" },
  { key: "business",   label: "Business" },
];

const STAT_TYPE_LABEL = {
  employment: "employment contracts",
  nda:        "NDAs",
  lease:      "lease agreements",
  freelance:  "freelance contracts",
  service:    "service agreements",
  business:   "business contracts",
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

  doc.setFillColor(9,9,20); doc.rect(0,0,W,42,"F");
  doc.setFillColor(...sc); doc.rect(0,38,W,4,"F");
  doc.setFillColor(120,60,220); doc.roundedRect(M, 8, 24, 24, 4, 4, "F");
  doc.setFontSize(16); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("CV", M+6, 23);
  doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("Contrivox", M+28, 23);
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(180,160,255);
  doc.text(t.app_tagline, M+28, 31);
  const scoreStr = `${result.score}/100 — ${t.score_label_map?.[result.score_label]||result.score_label}`;
  doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(...sc);
  doc.text(scoreStr, W-M, 20, { align:"right" });
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(160,150,200);
  doc.text(result.contract_type||"", W-M, 28, { align:"right" });

  y = 54;

  section(t.results_title);
  txt(result.summary, 10.5, false, [50,50,65]);
  nl(2);
  if(result.parties?.length) txt(`${t.parties}: ${result.parties.join(" · ")}`, 9, false, [110,100,130]);

  nl(6);
  doc.setFillColor(245,243,255); doc.roundedRect(M-3, y-4, CW+6, 26, 3, 3, "F");
  txt(t.score_why, 9, true, [90,70,170]);
  txt(result.score_reasoning, 10, false, [50,50,65]);
  nl(3);

  section(t.overall_rec);
  txt(result.overall_recommendation, 10.5, false, [50,50,65]);

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
    if(c.risk_note){ txt(`! ${c.risk_note}`, 9, false, [180,55,55]); }
    nl(3);
  });

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

  if(result.missing_protections?.length){
    section(t.tab_missing);
    result.missing_protections.forEach(m => { txt(`• ${m}`, 9.5, false, [65,65,80]); nl(1); });
  }

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
  const msg = `*${t.app_name} — ${t.results_title}*\n\n` +
    `${result.contract_type}\n` +
    `${t.score_lbl}: *${result.score}/100 — ${score_translated}*\n\n` +
    `${result.overall_recommendation}\n\n` +
    `${t.tab_flags}: ${result.red_flags?.length||0}\n` +
    `${t.tab_clauses}: ${result.key_clauses?.length||0}\n\n` +
    `_${t.disclaimer}_`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
}

const getAccount = () => { try{ return JSON.parse(localStorage.getItem("cvx_acc")||"null"); }catch{ return null; }};
const saveAccount = a => localStorage.setItem("cvx_acc", JSON.stringify(a));
const getHistory = () => { try{ return JSON.parse(localStorage.getItem("cvx_hist")||"[]"); }catch{ return []; }};
const pushHistory = entry => {
  const h = getHistory(); h.unshift(entry);
  localStorage.setItem("cvx_hist", JSON.stringify(h.slice(0,25)));
};

// ─── UI constants ─────────────────────────────────────────────────────────────
const COLORS = {
  bg:          "var(--cvx-bg)",
  surface:     "var(--cvx-surface)",
  border:      "var(--cvx-border)",
  accent:      "var(--cvx-accent)",
  accentGrad:  "var(--cvx-accent-grad)",
  danger:      "var(--cvx-danger)",
  text:        "var(--cvx-text)",
  muted:       "var(--cvx-muted)",
  faint:       "var(--cvx-faint)",
  heading:     "var(--cvx-heading)",
  nav:         "var(--cvx-nav)",
  modal:       "var(--cvx-modal)",
  overlay:     "var(--cvx-overlay)",
  inputBg:     "var(--cvx-input-bg)",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconAlertTriangle = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconShieldOff = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/>
    <path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconClock = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUpload = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconSearch = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconClipboard = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>
  </svg>
);
const IconFileDoc = ({size=24,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconLightbulb = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);
const IconLock = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconZap = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconGlobe = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconDownload = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ContrivoxLogo({ size=22 }) {
  const h = Math.round(size * 1.4);
  const w = Math.round((148 / 32) * h);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 148 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Contrivox"
      role="img"
      style={{ color: "var(--cvx-heading)" }}
    >
      <defs>
        <linearGradient id="cvx-icon-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="cvx-icon-s" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="7.5" fill="url(#cvx-icon-g)" />
      <rect width="32" height="32" rx="7.5" fill="url(#cvx-icon-s)" />
      <path d="M7 8 L16 23 L25 8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="26" x2="18" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <text
        x="43"
        y="22"
        fontFamily="'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="18"
        letterSpacing="-0.3"
        fill="currentColor"
      >
        <tspan fontWeight="500">Contri</tspan>
        <tspan fontWeight="700">vox</tspan>
      </text>
    </svg>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, t }) {
  const r=46, c=2*Math.PI*r, dash=(score/100)*c;
  const col = score>=70?"#22c55e":score>=50?"#eab308":score>=30?"#f97316":"#ef4444";
  const translatedLabel = t.score_label_map?.[label] || label;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="var(--cvx-faint)" strokeWidth="9"/>
        <circle cx="58" cy="58" r={r} fill="none" stroke={col} strokeWidth="9"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 58 58)"
          style={{ transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="58" y="52" textAnchor="middle" fill="var(--cvx-heading)" fontSize="26" fontWeight="700" fontFamily="'Fraunces',serif">{score}</text>
        <text x="58" y="70" textAnchor="middle" fill="var(--cvx-score-sub)" fontSize="11" fontFamily="'DM Sans',sans-serif">/100</text>
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
        <div style={{ padding:"0 14px 13px", borderTop:`0.5px solid ${COLORS.faint}` }}>
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

// ─── Preview card (shown after upload, before payment) ────────────────────────
function PreviewCard({ preview, onUnlock, unlockLoading, t }) {
  const isZeroFindings = preview.high_risk_count === 0 && preview.flagged_count === 0;
  const totalIssues = (preview.high_risk_count || 0) + (preview.flagged_count || 0);

  // Animated counter from 0 → final value over 1.5s
  const [highCount, setHighCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  useEffect(() => {
    if (isZeroFindings) return;
    const steps = 30, duration = 1500;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const p = step / steps;
      setHighCount(Math.round(preview.high_risk_count * p));
      setFlagCount(Math.round(preview.flagged_count * p));
      if (step >= steps) clearInterval(iv);
    }, duration / steps);
    return () => clearInterval(iv);
  }, []);

  const blurText = { fontSize:13, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", filter:"blur(3.5px)", userSelect:"none", lineHeight:1.6, margin:0, pointerEvents:"none" };
  const fadeOverlay = { position:"absolute", bottom:0, left:0, right:0, height:"65%", background:"linear-gradient(to bottom, transparent, var(--cvx-bg))", pointerEvents:"none" };
  const lockBadge = (
    <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:COLORS.faint, letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
      <IconLock size={10} color="currentColor"/> LOCKED
    </span>
  );

  return (
    <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, overflow:"hidden", animation:"fadeUp .5s ease" }}>
      {/* Header */}
      <div style={{ background:"rgba(255,255,255,0.03)", borderBottom:`0.5px solid ${COLORS.border}`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:"rgba(167,139,250,0.8)", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{t.preview_scanned}</p>
          <p style={{ fontSize:16, fontWeight:600, color:COLORS.heading, fontFamily:"'Fraunces',serif", margin:0 }}>{preview.contract_type}</p>
        </div>
        <span style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{preview.page_estimate} {preview.page_estimate === 1 ? "page" : "pages"} {t.preview_pages}</span>
      </div>

      {/* Counts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:`0.5px solid ${COLORS.border}` }}>
        <div style={{ padding:"20px 22px", textAlign:"center", borderRight:`0.5px solid ${COLORS.border}` }}>
          {!isZeroFindings && preview.high_risk_count > 0 && (
            <div style={{ marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#ef4444", background:"rgba(239,68,68,0.12)", padding:"2px 9px", borderRadius:20, letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>⚠ HIGH RISK</span>
            </div>
          )}
          {isZeroFindings
            ? <div style={{ fontSize:14, fontWeight:700, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", lineHeight:1.4, padding:"8px 0" }}>No major red flags detected</div>
            : <div style={{ fontSize:44, fontWeight:700, color:COLORS.danger, fontFamily:"'Fraunces',serif", lineHeight:1 }}>{highCount}</div>
          }
          {!isZeroFindings && <div style={{ fontSize:12, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", marginTop:7, lineHeight:1.5 }}>{t.preview_high_risk}</div>}
        </div>
        <div style={{ padding:"20px 22px", textAlign:"center" }}>
          {!isZeroFindings && preview.flagged_count > 0 && (
            <div style={{ marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#f59e0b", background:"rgba(245,158,11,0.12)", padding:"2px 9px", borderRadius:20, letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>! REVIEW NEEDED</span>
            </div>
          )}
          {isZeroFindings
            ? <div style={{ fontSize:14, fontWeight:700, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", lineHeight:1.4, padding:"8px 0" }}>Standard clauses present</div>
            : <div style={{ fontSize:44, fontWeight:700, color:"#fbbf24", fontFamily:"'Fraunces',serif", lineHeight:1 }}>{flagCount}</div>
          }
          {!isZeroFindings && <div style={{ fontSize:12, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", marginTop:7, lineHeight:1.5 }}>{t.preview_flagged}</div>}
        </div>
      </div>

      {/* Zero-findings reassurance */}
      {isZeroFindings && (
        <div style={{ padding:"14px 22px", background:"rgba(34,197,94,0.04)", borderBottom:`0.5px solid ${COLORS.faint}` }}>
          <p style={{ fontSize:12.5, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", lineHeight:1.65, margin:0, textAlign:"center" }}>
            Your full report includes your Fairness Score, complete clause-by-clause breakdown, and any missing legal protections — even in clean contracts.
          </p>
        </div>
      )}

      {/* Teaser locked rows */}
      <div style={{ padding:"4px 22px 0" }}>

        {/* Fairness Score */}
        <div style={{ padding:"14px 0", borderBottom:`0.5px solid ${COLORS.faint}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>Fairness Score (0–100)</span>
            {lockBadge}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:22, fontWeight:700, color:COLORS.faint, fontFamily:"'Fraunces',serif", letterSpacing:"-0.02em", userSelect:"none" }}>██/100</span>
            <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:"58%", height:"100%", background:"linear-gradient(90deg,#7c3aed,#6366f1)", borderRadius:3, filter:"blur(2px)" }}/>
            </div>
          </div>
        </div>

        {/* Full clause breakdown */}
        <div style={{ padding:"14px 0", borderBottom:`0.5px solid ${COLORS.faint}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>Full clause-by-clause breakdown</span>
            {lockBadge}
          </div>
          <div style={{ position:"relative", overflow:"hidden" }}>
            <p style={blurText}>Section 4.2 contains a restraint clause that may limit your ability to work in your industry for up to 24 months after leaving. Section 6.1 assigns all intellectual property created during employment to the employer, including work done outside business hours...</p>
            <div style={fadeOverlay}/>
          </div>
        </div>

        {/* Negotiation scripts */}
        <div style={{ padding:"14px 0", borderBottom:`0.5px solid ${COLORS.faint}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>Negotiation scripts for each red flag</span>
            {lockBadge}
          </div>
          <div style={{ position:"relative", overflow:"hidden" }}>
            <p style={blurText}>For the clause on page {Math.max(2, Math.floor((preview.page_estimate || 3) * 0.4))}, respond to your employer with: "I'd like to propose an amendment to this section — specifically regarding the scope of the restriction, which as written would prevent me from...</p>
            <div style={fadeOverlay}/>
          </div>
        </div>

        {/* Missing legal protections */}
        <div style={{ padding:"14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>Missing legal protections</span>
            {lockBadge}
          </div>
          <div style={{ position:"relative", overflow:"hidden" }}>
            <p style={blurText}>This contract is missing standard protections including severance provisions, written notice requirements before termination, and equity vesting acceleration on acquisition or change of control...</p>
            <div style={fadeOverlay}/>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div style={{ padding:"20px 22px 24px" }}>
        <p style={{ textAlign:"center", fontSize:12.5, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", marginBottom:12, lineHeight:1.5 }}>
          {totalIssues > 0
            ? `You have ${totalIssues} issue${totalIssues !== 1 ? "s" : ""} that need your attention before you sign.`
            : "Verify this contract is safe to sign."
          }
        </p>
        <button
          onClick={onUnlock}
          disabled={unlockLoading}
          style={{ width:"100%", padding:"16px", fontSize:15, fontWeight:700, background:unlockLoading?COLORS.surface:COLORS.accentGrad, color:unlockLoading?COLORS.faint:"white", border:"none", borderRadius:12, cursor:unlockLoading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:unlockLoading?"none":"0 4px 28px rgba(99,102,241,0.5)", letterSpacing:"0.01em", transition:"all .2s", marginBottom:8 }}
        >
          {unlockLoading ? "Redirecting to checkout…" : t.unlock_btn}
        </button>
        <p style={{ textAlign:"center", fontSize:12, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", marginBottom:8 }}>
          ⏱ Your report will be ready in 60 seconds
        </p>
        <p style={{ textAlign:"center", fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5, margin:0 }}>
          <IconLock size={10} color="currentColor"/> {t.unlock_trust}
        </p>
      </div>
    </div>
  );
}

// ─── Delivery panel (for history loads) ───────────────────────────────────────
function DeliveryPanel({ result, t, pdfUri }) {
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [emailSt, setEmailSt] = useState("idle");
  const [waSt, setWaSt] = useState("idle");

  const inp = { background:COLORS.inputBg, border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"10px 13px", color:COLORS.text, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", transition:"border-color .15s" };
  const btn = (grad, disabled) => ({ padding:"10px 16px", fontSize:12.5, fontWeight:700, background:disabled?COLORS.surface:grad, color:disabled?COLORS.faint:COLORS.heading, border:"none", borderRadius:9, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s" });

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
          <IconDownload size={12} color="currentColor"/> {t.download_pdf}
        </a>
      )}
    </div>
  );
}

function AuthModal({ t, onClose, onAuth }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const inp = { display:"block", width:"100%", background:COLORS.inputBg, border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"11px 13px", color:COLORS.text, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:10 };
  const submit = () => {
    if(!email) return;
    const acc = { name:name||email.split("@")[0], email, createdAt:Date.now() };
    saveAccount(acc); onAuth(acc); onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:COLORS.overlay, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:COLORS.modal, border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"30px 26px", width:"100%", maxWidth:380, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:18, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
        <ContrivoxLogo size={18}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:COLORS.heading, margin:"16px 0 20px" }}>{t.signin_title}</h2>
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
    <div style={{ position:"fixed", inset:0, background:COLORS.overlay, zIndex:1000, display:"flex", alignItems:"stretch", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:COLORS.modal, borderLeft:`0.5px solid ${COLORS.border}`, padding:"26px 22px", width:"100%", maxWidth:420, overflowY:"auto", position:"relative", display:"flex", flexDirection:"column", gap:0 }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:20, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22 }}>×</button>
        <ContrivoxLogo size={16}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:COLORS.heading, margin:"16px 0 4px" }}>{t.account_title}</h2>
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

function FaqItem({ q, a, initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen);
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
  const [outLang, setOutLang]             = useState("en");
  const [file, setFile]                   = useState(null);
  const [dragging, setDragging]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [loadMsg, setLoadMsg]             = useState("");
  const [preview, setPreview]             = useState(null);
  const [result, setResult]               = useState(null);   // history loads only
  const [tab, setTab]                     = useState("clauses");
  const [detectedType, setDetectedType]   = useState("employment");
  const [error, setError]                 = useState(null);
  const [pdfUri, setPdfUri]               = useState(null);
  const [account, setAccount]             = useState(null);
  const [showAuth, setShowAuth]           = useState(false);
  const [showHist, setShowHist]           = useState(false);
  const [sessionId, setSessionId]         = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [rejectedDoc, setRejectedDoc]     = useState(null);
  const [barWidths, setBarWidths]         = useState([0, 0, 0]);
  const fileRef    = useRef();
  const resultsRef = useRef();
  const statsRef   = useRef();
  const t = T.en;

  useEffect(() => { setAccount(getAccount()); }, []);

  useEffect(() => {
    if (!result) return;
    generatePDF(result, t).then(setPdfUri).catch(() => {});
  }, [result]);

  // Animate bars on mount and on tab change
  useEffect(() => {
    setBarWidths([0, 0, 0]);
    const timer = setTimeout(() => {
      setBarWidths((RISK_STATS[detectedType] ?? RISK_STATS.employment).map(({ stat }) => parseInt(stat)));
    }, 120);
    return () => clearTimeout(timer);
  }, [detectedType]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf","png","jpg","jpeg","gif","webp","txt","doc","docx"].includes(ext)) { setError("Unsupported file type."); return; }
    if (f.size > 20*1024*1024) { setError("File too large. Max 20MB."); return; }
    setFile(f); setError(null); setPreview(null); setResult(null);
    Analytics.contractUploaded({ file_type: ext, file_size_kb: Math.round(f.size / 1024) });
  }, []);

  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

  const analyse = async () => {
    if (!file) return;
    setLoading(true); setError(null); setPreview(null); setResult(null); setPdfUri(null); setSessionId(null); setRejectedDoc(null);

    const loadStart = Date.now();
    const loadTimers = [];
    const loadMsgs = ["Reading your contract...", "Scanning for risk clauses...", "Calculating fairness score...", "Preparing your summary..."];
    setLoadMsg(loadMsgs[0]);
    loadTimers.push(setTimeout(() => setLoadMsg(loadMsgs[1]), 1500));
    loadTimers.push(setTimeout(() => setLoadMsg(loadMsgs[2]), 3000));
    loadTimers.push(setTimeout(() => setLoadMsg(loadMsgs[3]), 4500));

    try {
      const payload = await extractFile(file);
      Analytics.analysisStarted({ file_type: file.name.split(".").pop()?.toLowerCase() ?? "unknown" });

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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const { sessionId: sid, preview: prev } = await res.json();

      // Hold on the last loading message until at least 4.5 s have elapsed
      const elapsed = Date.now() - loadStart;
      if (elapsed < 4500) await new Promise(r => setTimeout(r, 4500 - elapsed));

      // Reject non-contract documents before showing paywall
      if (prev && prev.is_contract === false) {
        setRejectedDoc(prev.rejected_type || "this type of document");
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        return;
      }

      setSessionId(sid);
      setPreview(prev);

      // Detect type for risk stats
      const typeStr = (prev?.contract_type ?? "").toLowerCase();
      if (typeStr.includes("nda") || typeStr.includes("non-disclosure") || typeStr.includes("confidential")) {
        setDetectedType("nda");
      } else if (typeStr.includes("lease") || typeStr.includes("rental") || typeStr.includes("tenancy")) {
        setDetectedType("lease");
      } else if (typeStr.includes("freelance") || typeStr.includes("independent contractor")) {
        setDetectedType("freelance");
      } else if (typeStr.includes("service") || typeStr.includes("vendor") || typeStr.includes("consulting")) {
        setDetectedType("service");
      } else if (typeStr.includes("business") || typeStr.includes("commercial") || typeStr.includes("partnership")) {
        setDetectedType("business");
      } else {
        setDetectedType("employment");
      }

      Analytics.previewShown({ contract_type: prev?.contract_type ?? "unknown", high_risk_count: prev?.high_risk_count ?? 0 });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    } catch (e) {
      setError("Could not process your contract. Please try again.");
      Analytics.analysisErrored(e.message);
    } finally {
      loadTimers.forEach(clearTimeout);
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
    } catch (e) {
      setError("Could not start checkout. Please try again.");
      setUnlockLoading(false);
    }
  };

  const scrollToUpload = () => {
    Analytics.ctaClicked("nav");
    document.getElementById("upload-sec")?.scrollIntoView({ behavior: "smooth" });
  };

  const tabBtn = (k, label) => (
    <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"7px 6px", fontSize:12, fontWeight:500, cursor:"pointer", borderRadius:9, border:"none", fontFamily:"'DM Sans',sans-serif", background:tab===k?"rgba(255,255,255,0.1)":"transparent", color:tab===k?COLORS.text:COLORS.muted, transition:"all .15s" }}>{label}</button>
  );

  const currentStats = RISK_STATS[detectedType] ?? RISK_STATS.employment;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:var(--cvx-bg);font-family:'DM Sans',sans-serif;-webkit-text-size-adjust:100%;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--cvx-scrollbar);border-radius:2px;}
        select,input,button{font-family:'DM Sans',sans-serif;}
        select option{background:var(--cvx-select-bg);color:var(--cvx-heading);}
        input::placeholder{color:var(--cvx-placeholder);}
        input:focus{border-color:rgba(139,92,246,0.45)!important;outline:none;}
        button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        @media(max-width:767px){
          nav{padding:0 14px!important;}
          .nav-links{display:none!important;}
          .sign-in-link{display:none!important;}
          section{padding-left:14px!important;padding-right:14px!important;}
          .hero-stats{grid-template-columns:1fr 1fr!important;}
          .fear-grid{grid-template-columns:1fr!important;}
          .how-grid{grid-template-columns:1fr!important;}
          .test-grid{grid-template-columns:1fr!important;}
          .risk-stats-grid{grid-template-columns:1fr!important;}
          button{min-height:48px;}
        }
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.2)}50%{box-shadow:0 0 35px rgba(139,92,246,0.45)}}
        .fear-card{transition:border-color .2s,transform .2s;}
        .fear-card:hover{border-color:rgba(239,68,68,0.32)!important;transform:translateY(-2px);}
        .how-card{transition:background .2s,transform .2s;}
        .how-card:hover{background:var(--cvx-surface)!important;transform:translateY(-2px);}
        .nav-link{transition:color .15s;}
        .nav-link:hover{color:var(--cvx-heading)!important;}
      `}</style>

      {showAuth && <AuthModal t={t} onClose={()=>setShowAuth(false)} onAuth={acc=>{ setAccount(acc); Analytics.signUpCompleted(acc.email); }}/>}
      {showHist && <HistoryPanel t={t} account={account} onClose={()=>setShowHist(false)} onLoad={r=>{ setResult(r); setPreview(null); setTab("clauses"); setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth"}),200); }}/>}

      <div style={{ minHeight:"100vh", background:COLORS.bg, backgroundImage:"radial-gradient(ellipse 65% 38% at 50% -4%, rgba(109,40,217,0.22) 0%, transparent 55%), radial-gradient(ellipse 35% 25% at 90% 90%, rgba(239,68,68,0.07) 0%, transparent 50%)" }}>

        {/* NAV */}
        <nav style={{ position:"sticky", top:0, zIndex:90, backdropFilter:"blur(18px)", background:COLORS.nav, borderBottom:`0.5px solid ${COLORS.border}`, padding:"0 20px" }}>
          <div style={{ maxWidth:980, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
            <ContrivoxLogo size={19}/>
            <div className="nav-links" style={{ display:"flex", alignItems:"center", gap:2 }}>
              <a href="#how" className="nav-link" style={{ padding:"6px 12px", fontSize:12.5, color:COLORS.muted, textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>How It Works</a>
              <a href="/sample-report" target="_blank" className="nav-link" style={{ padding:"6px 12px", fontSize:12.5, color:COLORS.muted, textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>Sample Report</a>
              <a href="#faq" className="nav-link" style={{ padding:"6px 12px", fontSize:12.5, color:COLORS.muted, textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>FAQ</a>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <ThemeToggle />
              {account ? (
                <>
                  <button onClick={()=>setShowHist(true)} className="nav-link" style={{ padding:"6px 13px", fontSize:12, fontWeight:500, background:COLORS.inputBg, color:COLORS.muted, border:`0.5px solid ${COLORS.border}`, borderRadius:8, cursor:"pointer" }}>{t.nav_history}</button>
                  <button onClick={()=>{ Analytics.signedOut(); saveAccount(null); setAccount(null); }} className="nav-link" style={{ padding:"6px 10px", fontSize:12, background:"none", color:COLORS.faint, border:"none", cursor:"pointer" }}>{t.signout}</button>
                </>
              ) : (
                <>
                  <button onClick={()=>{ Analytics.signInClicked(); setShowAuth(true); }} className="nav-link sign-in-link" style={{ padding:"6px 8px", fontSize:14, fontWeight:400, background:"none", color:COLORS.muted, border:"none", cursor:"pointer" }}>{t.nav_signin}</button>
                  <button onClick={scrollToUpload} style={{ padding:"7px 16px", fontSize:12.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:8, cursor:"pointer", animation:"glow 3s infinite", letterSpacing:"0.01em", minHeight:36 }}>{t.nav_cta}</button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding:"88px 20px 64px", textAlign:"center" }}>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <a href="/sample-report" target="_blank" onClick={()=>Analytics.ctaClicked("hero_badge")} style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:22, padding:"4px 14px", background:"rgba(124,58,237,0.09)", borderRadius:20, border:"0.5px solid rgba(124,58,237,0.22)", textDecoration:"none" }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--cvx-accent)", animation:"pulse 2s infinite", flexShrink:0 }}/>
              <span style={{ fontSize:10.5, fontWeight:700, color:"#a78bfa", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_badge}</span>
            </a>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(36px,7vw,66px)", color:COLORS.heading, lineHeight:1.07, marginBottom:20, fontWeight:600 }}>
              {t.hero_h1a}<br/>
              <em style={{ color:COLORS.danger, fontStyle:"italic" }}>{t.hero_h1b}</em>
            </h1>
            <p style={{ fontSize:"clamp(14.5px,1.9vw,17px)", color:COLORS.muted, lineHeight:1.76, maxWidth:500, margin:"0 auto 14px", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_sub}</p>
            <p style={{ fontSize:13, color:COLORS.muted, marginBottom:32, fontFamily:"'DM Sans',sans-serif" }}>{t.hero_social}</p>

            {/* Stats */}
            <div className="hero-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, maxWidth:520, margin:"0 auto 28px" }}>
              {[[t.stat1v,t.stat1l],[t.stat2v,t.stat2l],[t.stat3v,t.stat3l]].map(([v,l],i)=>(
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:12, padding:"13px 10px" }}>
                  <div style={{ fontSize:"clamp(19px,3.2vw,28px)", fontWeight:600, color:COLORS.danger, fontFamily:"'Fraunces',serif", marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:"clamp(9px,1vw,10.5px)", color:COLORS.muted, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Sample report CTA */}
            <a href="/sample-report" target="_blank" onClick={()=>Analytics.ctaClicked("hero")} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"rgba(167,139,250,0.85)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none", padding:"8px 18px", border:"0.5px solid rgba(139,92,246,0.3)", borderRadius:8, background:"rgba(139,92,246,0.06)", transition:"all .15s" }}>
              {t.sample_btn}
            </a>
          </div>
        </section>

        {/* FEAR SECTION */}
        <section style={{ padding:"0 20px 72px" }}>
          <div className="fear-grid" style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:12 }}>
            {[[t.fear1t,t.fear1b],[t.fear2t,t.fear2b],[t.fear3t,t.fear3b]].map(([title,body],i)=>{
              const fearIcons = [
                <IconAlertTriangle size={18} color="#f87171"/>,
                <IconShieldOff size={18} color="#f87171"/>,
                <IconClock size={18} color="#f87171"/>,
              ];
              return (
                <div key={i} className="fear-card" style={{ background:"rgba(239,68,68,0.04)", border:"0.5px solid rgba(239,68,68,0.13)", borderRadius:14, padding:"22px 20px" }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:"rgba(239,68,68,0.09)", border:"0.5px solid rgba(239,68,68,0.18)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                    {fearIcons[i]}
                  </div>
                  <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17.5, color:COLORS.heading, marginBottom:10, lineHeight:1.2, fontWeight:600 }}>{title}</h3>
                  <p style={{ fontSize:13, color:COLORS.muted, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TRUST STRIP */}
        <section style={{ padding:"0 20px 40px" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <p style={{ fontSize:11, color:COLORS.faint, textAlign:"center", letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>{t.trust_label}</p>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"8px 14px" }}>
              {t.trust_items.map((item,i)=>(
                <span key={i} style={{ fontSize:12, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", padding:"5px 14px", background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:20 }}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* RISK STATS */}
        <section ref={statsRef} style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(22px,3.5vw,32px)", color:COLORS.heading, textAlign:"center", marginBottom:8, fontWeight:600 }}>{t.risk_stats_title}</h2>
            <p style={{ fontSize:13, color:COLORS.muted, textAlign:"center", marginBottom:20, fontFamily:"'DM Sans',sans-serif" }}>
              Based on{" "}
              <span style={{ color:COLORS.text, fontWeight:500 }}>
                {STAT_TYPE_LABEL[detectedType]}
              </span>
              {preview ? " — detected from your upload." : "."}
            </p>

            {/* Tab switcher */}
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:6, marginBottom:24 }}>
              {STAT_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDetectedType(key)}
                  style={{
                    padding:"6px 14px", fontSize:12, fontWeight:600, borderRadius:20, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", transition:"all .18s",
                    background: detectedType === key ? "var(--cvx-accent)" : "rgba(255,255,255,0.05)",
                    color:      detectedType === key ? "white"            : COLORS.muted,
                    border:     detectedType === key ? "none"             : `0.5px solid ${COLORS.border}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="risk-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {currentStats.map(({ stat, desc }, i) => {
                const pct = parseInt(stat);
                const barColor = pct >= 75 ? "var(--cvx-accent)" : pct >= 50 ? "#F59E0B" : "var(--cvx-accent)";
                return (
                  <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"20px 18px", textAlign:"center" }}>
                    <div style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:700, color:"var(--cvx-accent)", fontFamily:"'Fraunces',serif", marginBottom:6, lineHeight:1 }}>{stat}</div>
                    {/* Animated progress bar */}
                    <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, margin:"10px 0 12px", overflow:"hidden" }}>
                      <div style={{ height:"100%", width: barWidths[i] + "%", background:barColor, borderRadius:3, transition:"width 800ms ease" }}/>
                    </div>
                    <div style={{ fontSize:12, color:COLORS.muted, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* UPLOAD */}
        <section id="upload-sec" style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:660, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"26px 24px", backdropFilter:"blur(12px)" }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:COLORS.heading, marginBottom:4, fontWeight:600 }}>{t.upload_title}</h2>
              <p style={{ fontSize:12, color:"var(--cvx-upload-label)", margin:"0 0 18px", fontFamily:"'DM Sans',sans-serif" }}>{t.upload_formats} · Any language</p>

              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx"
                onChange={e=>handleFile(e.target.files[0])}
                style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}
              />

              {file ? (
                <div style={{ background:"rgba(34,197,94,0.06)", border:"0.5px solid rgba(34,197,94,0.3)", borderRadius:13, padding:"18px 16px", display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:"rgba(34,197,94,0.1)", border:"0.5px solid rgba(34,197,94,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <IconFileDoc size={20} color="#4ade80"/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#4ade80", margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                    <p style={{ fontSize:11, color:COLORS.muted, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{(file.size/1024).toFixed(0)} KB · {file.name.split(".").pop().toUpperCase()}</p>
                  </div>
                  <button
                    onClick={()=>{ setFile(null); setPreview(null); setResult(null); }}
                    style={{ background:"rgba(239,68,68,0.12)", border:"0.5px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}
                  >✕</button>
                </div>
              ) : (
                <div
                  onDragOver={e=>{e.preventDefault();setDragging(true);}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={onDrop}
                  onClick={()=>fileRef.current.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e=>e.key==="Enter"&&fileRef.current.click()}
                  aria-label={t.upload_drop}
                  style={{ border:`1.5px dashed ${dragging?"rgba(139,92,246,0.7)":COLORS.faint}`, borderRadius:13, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:dragging?"rgba(139,92,246,0.05)":"rgba(255,255,255,0.015)", transition:"all .2s", marginBottom:18, WebkitTapHighlightColor:"transparent", touchAction:"manipulation", userSelect:"none" }}
                >
                  <div style={{ width:52, height:52, borderRadius:13, background:"rgba(139,92,246,0.12)", border:"0.5px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 13px" }}>
                    <IconFileDoc size={24} color="rgba(167,139,250,0.85)"/>
                  </div>
                  <p style={{ fontSize:15, fontWeight:600, color:COLORS.text, marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>{t.upload_drop}</p>
                  <p style={{ fontSize:11.5, color:"var(--cvx-upload-hint)", fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>{t.upload_or}</p>
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

              <button
                onClick={analyse}
                disabled={loading}
                style={{ width:"100%", padding:"16px", fontSize:15, fontWeight:700, borderRadius:12, border:file&&!loading?"1.5px solid transparent":"1.5px solid var(--cvx-upload-cta-idle-bd)", cursor:loading?"wait":"pointer", background:file&&!loading?COLORS.accentGrad:"var(--cvx-upload-cta-idle-bg)", color:file&&!loading?"white":"var(--cvx-upload-cta-idle-text)", transition:"all .25s ease", letterSpacing:"0.02em", touchAction:"manipulation", WebkitTapHighlightColor:"transparent", minHeight:52, boxShadow:file&&!loading?"0 4px 24px rgba(99,102,241,0.40)":"none" }}
              >
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/>
                    {loadMsg}
                  </span>
                ) : t.analyse_btn}
              </button>
              <p style={{ textAlign:"center", fontSize:11, color:"var(--cvx-upload-hint)", fontFamily:"'DM Sans',sans-serif", marginTop:10 }}>{t.analyse_trust}</p>
            </div>

            {/* Privacy note */}
            <div style={{ marginTop:14, display:"flex", alignItems:"flex-start", gap:8, padding:"12px 16px", background:"rgba(255,255,255,0.02)", border:`0.5px solid ${COLORS.border}`, borderRadius:10 }}>
              <IconLock size={12} color="var(--cvx-upload-label)" style={{ flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:11.5, color:"var(--cvx-upload-label)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, margin:0 }}>
                {t.privacy_note}{" "}
                <a href="/privacy" style={{ color:"var(--cvx-accent)", textDecoration:"underline" }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </section>

        {/* REJECTED DOCUMENT STATE */}
        {rejectedDoc && !preview && !result && (
          <section ref={resultsRef} style={{ padding:"0 20px 80px", animation:"fadeUp .5s ease" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>
              <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"40px 28px", textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:"rgba(245,158,11,0.1)", border:"0.5px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                  <IconAlertTriangle size={24} color="#fbbf24"/>
                </div>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:COLORS.heading, fontWeight:600, marginBottom:12 }}>This doesn't look like a contract</h2>
                <p style={{ fontSize:14, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", lineHeight:1.7, maxWidth:420, margin:"0 auto 16px" }}>
                  {/unreadable/i.test(rejectedDoc)
                    ? "We couldn't read the content of this file."
                    : <>We detected this might be a <strong style={{ color:COLORS.text }}>{rejectedDoc}</strong>.</>
                  }{" "}Contrivox works with employment agreements, NDAs, leases, freelance contracts, and service agreements.
                </p>
                {/unreadable/i.test(rejectedDoc) && (
                  <div style={{ background:"rgba(245,158,11,0.07)", border:"0.5px solid rgba(245,158,11,0.2)", borderRadius:10, padding:"12px 16px", maxWidth:400, margin:"0 auto 20px", textAlign:"left" }}>
                    <p style={{ fontSize:13, color:"#fbbf24", fontWeight:600, fontFamily:"'DM Sans',sans-serif", margin:"0 0 4px" }}>Tip: Word documents (.docx)</p>
                    <p style={{ fontSize:12.5, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, margin:0 }}>
                      Word files can't be read directly. In Word or Google Docs, choose <strong style={{ color:COLORS.text }}>File → Save as PDF</strong>, then upload the PDF instead.
                    </p>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
                  <button
                    onClick={() => { setRejectedDoc(null); setFile(null); setPreview(null); setError(null); }}
                    style={{ padding:"14px 32px", fontSize:14, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", minHeight:48, boxShadow:"0 4px 20px rgba(99,102,241,0.4)" }}
                  >
                    Try a Different File
                  </button>
                  <a href="/sample-report" target="_blank" style={{ fontSize:13, color:"rgba(167,139,250,0.8)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                    See a Sample Report →
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PREVIEW CARD (shown after upload, before payment) */}
        {preview && !result && (
          <section ref={resultsRef} style={{ padding:"0 20px 80px", animation:"fadeUp .5s ease" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>
              <PreviewCard preview={preview} onUnlock={handleUnlock} unlockLoading={unlockLoading} t={t}/>
            </div>
          </section>
        )}

        {/* FULL RESULT (history loads only — always unlocked) */}
        {result && (
          <section ref={!preview ? resultsRef : undefined} style={{ padding:"0 20px 80px", animation:"fadeUp .5s ease" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>

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
                  <p style={{ fontSize:12, color:COLORS.faint, fontStyle:"italic", fontFamily:"'DM Sans',sans-serif" }}>{result.score_reasoning}</p>
                </div>
              </div>

              <div style={{ background:"rgba(99,102,241,0.07)", border:"0.5px solid rgba(99,102,241,0.2)", borderRadius:13, padding:"15px 17px", marginBottom:12, display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:30, height:30, borderRadius:7, background:"rgba(99,102,241,0.14)", border:"0.5px solid rgba(99,102,241,0.22)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <IconLightbulb size={14} color="#818cf8"/>
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#818cf8", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{t.rec_title}</p>
                  <p style={{ fontSize:13, lineHeight:1.72, color:"var(--cvx-rec-text)", fontFamily:"'DM Sans',sans-serif" }}>{result.overall_recommendation}</p>
                </div>
              </div>

              <div style={{ display:"flex", gap:3, marginBottom:12, background:"rgba(255,255,255,0.024)", borderRadius:11, padding:"3px", border:"0.5px solid rgba(255,255,255,0.06)" }}>
                {tabBtn("clauses", `${t.tab_clauses} (${result.key_clauses?.length||0})`)}
                {tabBtn("flags",   `${t.tab_flags} (${result.red_flags?.length||0})`)}
                {tabBtn("missing", `${t.tab_missing} (${result.missing_protections?.length||0})`)}
              </div>

              <div style={{ background:"rgba(255,255,255,0.018)", border:"0.5px solid rgba(255,255,255,0.06)", borderRadius:14, padding:16, marginBottom:12 }}>
                {tab==="clauses" && (result.key_clauses?.length
                  ? result.key_clauses.map((c,i)=><ClauseCard key={i} clause={c} t={t}/>)
                  : <p style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:"20px 0", fontFamily:"'DM Sans',sans-serif" }}>{t.none_found}</p>
                )}
                {tab==="flags" && (result.red_flags?.length
                  ? result.red_flags.map((f,i)=><FlagCard key={i} flag={f} t={t}/>)
                  : <p style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:"20px 0", fontFamily:"'DM Sans',sans-serif" }}>{t.none_found}</p>
                )}
                {tab==="missing" && (result.missing_protections?.length
                  ? result.missing_protections.map((m,i)=>(
                    <div key={i} style={{ display:"flex", gap:9, padding:"10px 12px", marginBottom:7, background:"rgba(245,158,11,0.05)", border:"0.5px solid rgba(245,158,11,0.15)", borderRadius:9 }}>
                      <span style={{ color:"#fbbf24", flexShrink:0, display:"flex", paddingTop:1 }}><IconAlertTriangle size={14} color="#fbbf24"/></span>
                      <p style={{ fontSize:13, color:"rgba(255,255,255,0.68)", lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{m}</p>
                    </div>
                  ))
                  : <p style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:"20px 0", fontFamily:"'DM Sans',sans-serif" }}>{t.none_found}</p>
                )}
              </div>

              <DeliveryPanel result={result} t={t} pdfUri={pdfUri}/>
              <p style={{ marginTop:8, fontSize:11, color:COLORS.faint, textAlign:"center", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{result.disclaimer}</p>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:860, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:COLORS.heading, textAlign:"center", marginBottom:8, fontWeight:600 }}>{t.how_title}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, textAlign:"center", marginBottom:40, fontFamily:"'DM Sans',sans-serif" }}>60 seconds from upload to full report.</p>
            <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
              {[[t.how1t,t.how1b,"01"],[t.how2t,t.how2b,"02"],[t.how3t,t.how3b,"03"]].map(([title,body,n],i)=>{
                const howIcons = [
                  <IconUpload size={18} color="rgba(167,139,250,0.9)"/>,
                  <IconSearch size={18} color="rgba(167,139,250,0.9)"/>,
                  <IconClipboard size={18} color="rgba(167,139,250,0.9)"/>,
                ];
                return (
                  <div key={i} className="how-card" style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"22px 20px", position:"relative" }}>
                    <div style={{ position:"absolute", top:18, right:18, fontSize:11, fontWeight:700, color:"rgba(139,92,246,0.4)", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>{n}</div>
                    <div style={{ width:38, height:38, borderRadius:9, background:"rgba(139,92,246,0.1)", border:"0.5px solid rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                      {howIcons[i]}
                    </div>
                    <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17, color:COLORS.heading, marginBottom:7, lineHeight:1.25, fontWeight:600 }}>{title}</h3>
                    <p style={{ fontSize:12.5, color:COLORS.muted, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* REPORT MOCKUP */}
        <section style={{ padding:"60px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:760, margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontSize:13, fontWeight:600, color:COLORS.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:24 }}>Here's what your report looks like</p>
            <div style={{ transform:"rotate(-1deg)", boxShadow:"0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)", borderRadius:18, overflow:"hidden", border:`0.5px solid ${COLORS.border}`, background:"#101018" }}>
              {/* Mockup header */}
              <div style={{ background:"#0d0d1a", borderBottom:"0.5px solid rgba(255,255,255,0.07)", padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"white" }}>CV</span>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.8)", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", margin:0 }}>Contract Analysis Report</p>
                    <p style={{ fontSize:13, fontWeight:600, color:"#f0eeff", fontFamily:"'Fraunces',serif", margin:0 }}>Employment Agreement</p>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:"#fbbf24", fontFamily:"'Fraunces',serif", lineHeight:1 }}>61</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif" }}>/100 fairness</div>
                </div>
              </div>
              {/* Score bar */}
              <div style={{ height:3, background:"rgba(255,255,255,0.07)" }}>
                <div style={{ width:"61%", height:"100%", background:"linear-gradient(90deg,#f59e0b,#fbbf24)" }}/>
              </div>
              {/* Flag cards */}
              <div style={{ padding:"16px 22px", display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { level:"HIGH RISK", color:"#f87171", bg:"rgba(239,68,68,0.09)", bd:"rgba(239,68,68,0.2)", icon:"⚠", title:"Non-Compete Clause", body:"Bans you from working in the tech industry within 50 miles for 24 months." },
                  { level:"HIGH RISK", color:"#f87171", bg:"rgba(239,68,68,0.09)", bd:"rgba(239,68,68,0.2)", icon:"⚠", title:"Arbitration Clause", body:"Waives your right to sue or join class actions. All disputes go to private arbitration." },
                  { level:"REVIEW NEEDED", color:"#fbbf24", bg:"rgba(245,158,11,0.08)", bd:"rgba(245,158,11,0.2)", icon:"!", title:"IP Assignment", body:"Assigns all work created during employment to the employer, including personal projects." },
                ].map((c,i) => (
                  <div key={i} style={{ background:c.bg, border:`0.5px solid ${c.bd}`, borderRadius:10, padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                      <span style={{ fontSize:9, fontWeight:700, color:c.color, background:`${c.bd}`, padding:"2px 8px", borderRadius:20, letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif" }}>{c.icon} {c.level}</span>
                      <span style={{ fontSize:12.5, fontWeight:600, color:"#f0eeff", fontFamily:"'DM Sans',sans-serif" }}>{c.title}</span>
                    </div>
                    <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.6)", fontFamily:"'DM Sans',sans-serif", margin:0, lineHeight:1.55 }}>{c.body}</p>
                  </div>
                ))}
                {/* Locked bottom */}
                <div style={{ position:"relative", marginTop:4, borderRadius:10, overflow:"hidden" }}>
                  <div style={{ padding:"14px", background:"rgba(255,255,255,0.03)", border:`0.5px solid ${COLORS.border}`, borderRadius:10, filter:"blur(3px)", userSelect:"none", pointerEvents:"none" }}>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", margin:0 }}>Negotiation script: "Request that the non-compete be limited to direct competitors within your specific role..." and 4 more clauses with word-for-word negotiation scripts.</p>
                  </div>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(9,9,15,0.65)", borderRadius:10 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"rgba(167,139,250,0.9)", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.03em" }}>🔒 Negotiation scripts unlocked after purchase</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="/sample-report" target="_blank" style={{ display:"inline-block", marginTop:20, fontSize:13, color:"rgba(167,139,250,0.8)", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>See full sample →</a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding:"72px 20px" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:COLORS.heading, textAlign:"center", marginBottom:8, fontWeight:600 }}>{t.test_title}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, textAlign:"center", marginBottom:40, fontFamily:"'DM Sans',sans-serif" }}>What people found in their contracts.</p>
            <div className="test-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:12 }}>
              {[
                [t.t1n, t.t1r, t.t1t, "IP Assignment Clause"],
                [t.t2n, t.t2r, t.t2t, "Non-Compete Clause"],
                [t.t3n, t.t3r, t.t3t, "Auto-Renewal Clause"],
              ].map(([name, role, text, badge], i) => (
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"20px 18px", display:"flex", flexDirection:"column" }}>
                  <span style={{ display:"inline-block", alignSelf:"flex-start", marginBottom:12, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--cvx-accent)", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.30)", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>{badge}</span>
                  <div style={{ marginBottom:12, color:"#f59e0b", fontSize:12, letterSpacing:"2px" }}>★★★★★</div>
                  <p style={{ fontSize:13, color:COLORS.text, lineHeight:1.74, marginBottom:16, fontStyle:"italic", fontFamily:"'DM Sans',sans-serif", flex:1 }}>"{text}"</p>
                  <div style={{ borderTop:`0.5px solid ${COLORS.border}`, paddingTop:12 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", margin:"0 0 2px" }}>{name}</p>
                    <p style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", margin:0 }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,38px)", color:COLORS.heading, textAlign:"center", marginBottom:36, fontWeight:600 }}>{t.faq_title}</h2>
            <FaqItem q={t.faq1q} a={t.faq1a} initialOpen={true}/>
            <FaqItem q={t.faq4q} a={t.faq4a} initialOpen={true}/>
            <FaqItem q={t.faq5q} a={t.faq5a} initialOpen={true}/>
            <FaqItem q={t.faq3q} a={t.faq3a}/>
            <FaqItem q={t.faq2q} a={t.faq2a}/>
            <FaqItem q={t.faq6q} a={t.faq6a}/>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:"80px 20px", textAlign:"center", background:"rgba(99,102,241,0.05)", borderTop:"0.5px solid rgba(99,102,241,0.14)" }}>
          <div style={{ maxWidth:520, margin:"0 auto" }}>
            <ContrivoxLogo size={20}/>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(24px,4vw,40px)", color:COLORS.heading, margin:"20px 0 10px", lineHeight:1.15, fontWeight:600 }}>{t.cta_band}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, marginBottom:10, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
              {t.cta_urgency}
            </p>
            <button onClick={()=>{ Analytics.ctaClicked("cta_band"); document.getElementById("upload-sec")?.scrollIntoView({behavior:"smooth"}); }} style={{ padding:"16px 40px", fontSize:15.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 5px 30px rgba(99,102,241,0.38)", animation:"glow 3s infinite", letterSpacing:"0.01em", minHeight:52, marginTop:10 }}>
              Check My Contract — $9
            </button>
            <p style={{ marginTop:12, fontSize:11.5, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.cta_trust}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginTop:18, flexWrap:"wrap" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}><IconLock size={14} color="var(--cvx-accent)"/> Private &amp; secure</span>
              <span style={{ color:"rgba(255,255,255,0.18)", fontSize:14 }}>·</span>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}><IconZap size={14} color="var(--cvx-accent)"/> Results in 60 seconds</span>
              <span style={{ color:"rgba(255,255,255,0.18)", fontSize:14 }}>·</span>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}><IconGlobe size={14} color="var(--cvx-accent)"/> Any language</span>
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
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:0, marginBottom:14, flexWrap:"wrap" }}>
            {[
              { label:"Privacy Policy", href:"/privacy" },
              { label:"Terms of Service", href:"/terms" },
              { label:"Contact", href:"/contact" },
              { label:"Contact Us", href:"mailto:contact@contrivox.com" },
            ].map(({ label, href }, i, arr) => (
              <span key={href} style={{ display:"flex", alignItems:"center" }}>
                <a href={href} style={{ fontSize:12, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif", textDecoration:"none", padding:"3px 2px", transition:"color .15s" }}
                  onMouseOver={e=>e.currentTarget.style.color="var(--cvx-heading)"}
                  onMouseOut={e=>e.currentTarget.style.color="var(--cvx-muted)"}
                >{label}</a>
                {i < arr.length - 1 && <span style={{ color:"rgba(255,255,255,0.18)", fontSize:11, margin:"0 10px" }}>·</span>}
              </span>
            ))}
          </div>
          <p style={{ fontSize:11, color:COLORS.faint, maxWidth:600, margin:"0 auto", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{t.disclaimer}</p>
        </footer>
      </div>
    </>
  );
}
