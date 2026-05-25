#!/usr/bin/env node
// Run once: node scripts/generate-checklist-pdf.js

const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const clauses = [
  {
    title: "Non-compete clause",
    desc: "Scope, duration, and geography — is it enforceable in your state?",
  },
  {
    title: "Mandatory arbitration",
    desc: "Waives your right to sue in court or join a class action.",
  },
  {
    title: "IP assignment",
    desc: "Who owns work you create — during or outside business hours?",
  },
  {
    title: "At-will employment",
    desc: "Can you be fired without cause or notice?",
  },
  {
    title: "Auto-renewal",
    desc: "Hidden re-enrollment that charges you past your intended end date.",
  },
  {
    title: "Limitation of liability",
    desc: "Cap on damages — is it one-sided against you?",
  },
  {
    title: "Indemnification",
    desc: "Who pays if something goes wrong, and for what?",
  },
  {
    title: "Governing law & jurisdiction",
    desc: "Which state's laws apply, and where disputes are resolved.",
  },
  {
    title: "Notice & termination",
    desc: "How much notice is required, and under what conditions.",
  },
  {
    title: "Non-solicitation",
    desc: "Restrictions on hiring ex-colleagues or contacting past clients.",
  },
  {
    title: "Exclusivity clause",
    desc: "Can you work with competitors, freelance, or take side projects?",
  },
  {
    title: "Liquidated damages",
    desc: "Fixed penalty clauses — are they proportionate and enforceable?",
  },
];

const doc = new jsPDF({ unit: "pt", format: "letter", compress: true });

const W = 612;

// ── Header bar ──────────────────────────────────────────────────────────────
doc.setFillColor(9, 9, 15);
doc.rect(0, 0, W, 88, "F");

doc.setTextColor(139, 92, 246);
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.text("CONTRIVOX", 40, 32);

doc.setTextColor(240, 238, 255);
doc.setFontSize(20);
doc.setFont("helvetica", "bold");
doc.text("The 12 Contract Clauses to Check", 40, 56);
doc.text("Before You Sign", 40, 76);

// ── Sub-header ───────────────────────────────────────────────────────────────
doc.setFillColor(245, 243, 255);
doc.rect(0, 88, W, 40, "F");
doc.setTextColor(100, 80, 180);
doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.text(
  "Check each box as you review your contract. Flag any clause you don't understand.",
  40,
  113
);

// ── Clauses ──────────────────────────────────────────────────────────────────
let y = 152;
const ROW_H = 44;
const COL1 = 40;   // checkbox x
const COL2 = 68;   // text x
const BOX  = 12;   // checkbox size

clauses.forEach((clause, i) => {
  const isEven = i % 2 === 0;
  if (isEven) {
    doc.setFillColor(252, 250, 255);
  } else {
    doc.setFillColor(255, 255, 255);
  }
  doc.rect(0, y - 14, W, ROW_H, "F");

  // Checkbox
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1.2);
  doc.roundedRect(COL1, y - 10, BOX, BOX, 2, 2, "S");

  // Number badge
  doc.setFillColor(139, 92, 246);
  doc.circle(COL2 + 8, y - 4, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const num = String(i + 1);
  doc.text(num, COL2 + 8, y - 1, { align: "center" });

  // Title
  doc.setTextColor(20, 15, 50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(clause.title, COL2 + 24, y - 1);

  // Description
  doc.setTextColor(90, 80, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(clause.desc, COL2 + 24, y + 13);

  // Subtle divider
  doc.setDrawColor(220, 215, 240);
  doc.setLineWidth(0.5);
  doc.line(COL2, y + ROW_H - 16, W - 40, y + ROW_H - 16);

  y += ROW_H;
});

// ── CTA band ─────────────────────────────────────────────────────────────────
const ctaY = y + 18;
doc.setFillColor(124, 58, 237);
doc.roundedRect(40, ctaY, W - 80, 52, 8, 8, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("Found a clause you don't understand?", W / 2, ctaY + 20, { align: "center" });
doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.text(
  "Upload your contract at contrivox.com — plain-English analysis in 60 seconds.",
  W / 2,
  ctaY + 37,
  { align: "center" }
);

// ── Footer ────────────────────────────────────────────────────────────────────
const footY = ctaY + 72;
doc.setDrawColor(200, 195, 225);
doc.setLineWidth(0.5);
doc.line(40, footY, W - 40, footY);

doc.setTextColor(140, 130, 170);
doc.setFontSize(8);
doc.setFont("helvetica", "normal");
doc.text(
  "Contrivox is not a law firm. This checklist is for informational purposes only.",
  W / 2,
  footY + 14,
  { align: "center" }
);
doc.text(
  "Consult a qualified attorney before signing any contract.   ·   contrivox.com",
  W / 2,
  footY + 26,
  { align: "center" }
);

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = path.join(
  __dirname,
  "..",
  "public",
  "downloads",
  "contrivox-12-clauses-checklist.pdf"
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const buf = Buffer.from(doc.output("arraybuffer"));
fs.writeFileSync(outPath, buf);
console.log(`PDF written: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
