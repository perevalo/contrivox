# SKILL: PDF Generation
# Trigger: any task involving generating, styling, or delivering the Contrivox
#          PDF report (jsPDF, branding, layout, download, email attachment).

## What this skill covers
- Client-side PDF generation with jsPDF
- Contrivox brand layout (header, score ring, sections, footer)
- Converting PDF to base64 for email attachment
- Triggering download on client

---

## LOADING jsPDF (client-side only)

```typescript
// Load once in useEffect — do NOT import at module level (SSR breaks)
useEffect(() => {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = () => setJsPdfReady(true);
  document.head.appendChild(script);
}, []);
```

---

## PDF LAYOUT CONSTANTS

```typescript
const PDF = {
  W: 210,          // A4 width mm
  H: 297,          // A4 height mm
  M: 18,           // margin left/right
  FOOTER_Y: 284,   // footer baseline
  MAX_Y: 272,      // max content y before new page
  LINE_H: 5,       // default line height multiplier
  // Brand colours (RGB)
  BRAND_DARK:   [9, 9, 20]    as const,
  BRAND_PURPLE: [124, 58, 237] as const,
  BRAND_ACCENT: [99, 102, 241] as const,
  SCORE_COLORS: {
    Fair:       [34, 197, 94]  as const,
    Acceptable: [132, 204, 22] as const,
    Concerning: [234, 179, 8]  as const,
    Unfair:     [249, 115, 22] as const,
    Dangerous:  [239, 68, 68]  as const,
  },
  RISK_COLORS: {
    high:   [210, 40, 40]  as const,
    medium: [190, 130, 0]  as const,
    low:    [30, 140, 80]  as const,
  },
} as const;
```

---

## CORE GENERATOR FUNCTION

```typescript
export async function generateContrivoxPDF(
  result: ContrivoxAnalysis,
  t: Translation
): Promise<string> { // returns data URI string
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const CW = PDF.W - PDF.M * 2; // content width
  let y = 0;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const newPage = () => { doc.addPage(); y = 22; };
  const checkY  = (needed = 10) => { if (y + needed > PDF.MAX_Y) newPage(); };

  const addText = (
    text: string,
    size = 10.5,
    bold = false,
    color: [number,number,number] = [45, 45, 60],
    maxW = CW
  ) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text ?? ""), maxW);
    checkY(lines.length * (size * 0.38 + 1));
    doc.text(lines, PDF.M, y);
    y += lines.length * (size * 0.38 + 1.8);
  };

  const addSection = (label: string) => {
    y += 5;
    checkY(14);
    doc.setFillColor(242, 239, 255);
    doc.roundedRect(PDF.M - 3, y - 5, CW + 6, 11, 2, 2, "F");
    addText(label, 11, true, [70, 50, 170]);
    y += 2;
  };

  // ── Cover header ─────────────────────────────────────────────────────────
  const sc = PDF.SCORE_COLORS[result.score_label] ?? [120, 120, 140];
  doc.setFillColor(...PDF.BRAND_DARK);
  doc.rect(0, 0, PDF.W, 40, "F");
  doc.setFillColor(...sc);
  doc.rect(0, 36, PDF.W, 4, "F");

  // Logo box
  doc.setFillColor(...PDF.BRAND_PURPLE);
  doc.roundedRect(PDF.M, 7, 22, 22, 4, 4, "F");
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CV", PDF.M + 5, 21);

  // App name
  doc.setFontSize(20);
  doc.text("Contrivox", PDF.M + 26, 20);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 160, 255);
  doc.text(t.app_tagline, PDF.M + 26, 28);

  // Score top-right
  const scoreStr = `${result.score}/100 — ${t.score_label_map?.[result.score_label] ?? result.score_label}`;
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.setTextColor(...sc);
  doc.text(scoreStr, PDF.W - PDF.M, 19, { align: "right" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 150, 200);
  doc.text(result.contract_type ?? "", PDF.W - PDF.M, 27, { align: "right" });

  y = 52;

  // ── Body sections ─────────────────────────────────────────────────────────
  addSection(t.results_title);
  addText(result.summary, 10.5, false, [50, 50, 65]);
  y += 2;
  if (result.parties?.length)
    addText(`${t.parties}: ${result.parties.join(" · ")}`, 9, false, [110, 100, 130]);

  addSection(t.score_why);
  addText(result.score_reasoning, 10.5, false, [50, 50, 65]);

  addSection(t.overall_rec);
  addText(result.overall_recommendation, 10.5, false, [50, 50, 65]);

  addSection(t.tab_clauses);
  (result.key_clauses ?? []).forEach((c, i) => {
    checkY(18);
    const rc = PDF.RISK_COLORS[c.risk_level] ?? [100, 100, 100];
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.setTextColor(...rc);
    doc.text(`${i + 1}. [${(c.risk_level ?? "").toUpperCase()}]`, PDF.M, y);
    doc.setTextColor(30, 30, 45);
    const titleLines = doc.splitTextToSize(c.title ?? "", CW - 22);
    doc.text(titleLines, PDF.M + 22, y);
    y += Math.max(5, titleLines.length * 4.2);
    addText(c.plain_english, 9.5, false, [65, 65, 80]);
    if (c.risk_note) addText(`⚠ ${c.risk_note}`, 9, false, [180, 55, 55]);
    y += 3;
  });

  addSection(t.tab_flags);
  (result.red_flags ?? []).forEach((f, i) => {
    checkY(16);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.setTextColor(195, 35, 35);
    const issueLines = doc.splitTextToSize(`${i + 1}. ${f.issue ?? ""}`, CW);
    doc.text(issueLines, PDF.M, y);
    y += issueLines.length * 4.5;
    addText(f.why_it_matters, 9.5, false, [65, 65, 80]);
    if (f.challengeable && f.challenge) {
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 65, 175);
      doc.text(`${t.suggested}:`, PDF.M, y); y += 4;
      addText(f.challenge, 9, false, [75, 65, 175]);
    }
    y += 4;
  });

  if (result.missing_protections?.length) {
    addSection(t.tab_missing);
    result.missing_protections.forEach((m) => {
      addText(`• ${m}`, 9.5, false, [65, 65, 80]); y += 1;
    });
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 237, 255);
    doc.rect(0, PDF.FOOTER_Y, PDF.W, 13, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 100, 140);
    const disc = doc.splitTextToSize(result.disclaimer ?? t.disclaimer, CW);
    doc.text(disc[0] ?? "", PDF.M, PDF.FOOTER_Y + 6);
    doc.setFontSize(8); doc.setTextColor(140, 130, 170);
    doc.text(`${i} / ${pages}`, PDF.W - PDF.M, PDF.FOOTER_Y + 6, { align: "right" });
  }

  return doc.output("datauristring");
}
```

---

## TRIGGERING DOWNLOAD

```typescript
// Trigger browser download from data URI
export function downloadPDF(dataUri: string, filename = "Contrivox-Report.pdf") {
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = filename;
  link.click();
}
```

---

## EXTRACTING BASE64 FOR EMAIL

```typescript
// Convert data URI to base64 for Resend attachment
export function dataUriToBase64(dataUri: string): string {
  return dataUri.split(",")[1] ?? "";
}
```

---

## SECURITY NOTES
- PDF is generated entirely client-side — contract content never travels to server for PDF
- Data URI is stored in React state only — cleared on unmount
- If sending via email, base64 is posted to `/api/send-report` over HTTPS
- Never log the base64 PDF content (contains contract text)
