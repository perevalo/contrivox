import type { ContrivoxAnalysis } from "./validation";

const SCORE_COLORS: Record<string, [number, number, number]> = {
  Fair:       [34,  197, 94],
  Acceptable: [132, 204, 22],
  Concerning: [234, 179, 8],
  Unfair:     [249, 115, 22],
  Dangerous:  [239, 68,  68],
};
const RISK_COLORS: Record<string, [number, number, number]> = {
  high:   [210, 40,  40],
  medium: [190, 130, 0],
  low:    [30,  140, 80],
};

export async function generateReportPDFBase64(analysis: ContrivoxAnalysis): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - M * 2;
  let y = 20;

  const sc = SCORE_COLORS[analysis.score_label] ?? [120, 120, 140];

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

  // Header
  doc.setFillColor(9, 9, 20);
  doc.rect(0, 0, W, 40, "F");
  doc.setFillColor(...sc);
  doc.rect(0, 36, W, 4, "F");
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
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(M - 3, y - 4, CW + 6, 24, 3, 3, "F");
  txt("Score Reasoning", 9, true, [90, 70, 170]);
  txt(analysis.score_reasoning, 10, false, [50, 50, 65]);
  nl(2);

  section("Our Recommendation");
  txt(analysis.overall_recommendation, 10.5, false, [50, 50, 65]);

  section("Key Clauses");
  (analysis.key_clauses ?? []).forEach((c, i) => {
    if (y > 258) { doc.addPage(); y = 20; }
    const rc = RISK_COLORS[c.risk_level] ?? ([100, 100, 110] as [number, number, number]);
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
    doc.setFillColor(240, 237, 255);
    doc.rect(0, 284, W, 13, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 100, 140);
    const disc = doc.splitTextToSize(analysis.disclaimer ?? "Contrivox is not a law firm. For informational purposes only.", CW);
    doc.text(disc[0] ?? "", M, 290);
    doc.setFontSize(8); doc.setTextColor(140, 130, 170);
    doc.text(`${i} / ${pages}`, W - M, 290, { align: "right" });
  }

  return doc.output("datauristring").split(",")[1];
}
