export type JurisdictionResult = {
  country:          string;
  jurisdiction:     string;
  jurisdictionCode: string;
  confidence:       number;
  signals:          string[];
  candidates: Array<{
    jurisdictionCode: string;
    jurisdiction:     string;
    confidence:       number;
  }>;
};

type SignalDef = { pattern: RegExp; code: string; weight: number; desc: string };

// ─── Signal definitions ────────────────────────────────────────────────────────

const SIGNALS: SignalDef[] = [
  // === GOVERNING LAW CLAUSES (0.3) ===
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?california\b/i,           code: "US-CA",      weight: 0.3, desc: "California governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?new\s+york\b/i,           code: "US-NY",      weight: 0.3, desc: "New York governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?texas\b/i,                code: "US-TX",      weight: 0.3, desc: "Texas governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?florida\b/i,              code: "US-FL",      weight: 0.3, desc: "Florida governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?illinois\b/i,             code: "US-IL",      weight: 0.3, desc: "Illinois governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?washington\b/i,           code: "US-WA",      weight: 0.3, desc: "Washington governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:province\s+of\s+)?ontario\b/i,           code: "CA-ON",      weight: 0.3, desc: "Ontario governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:province\s+of\s+)?british\s+columbia\b/i,code: "CA-BC",      weight: 0.3, desc: "British Columbia governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:province\s+of\s+)?alberta\b/i,           code: "CA-AB",      weight: 0.3, desc: "Alberta governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+canada\b/i,                                            code: "CA-federal", weight: 0.3, desc: "Canada governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:england\b|england\s+and\s+wales)/i,                 code: "UK",         weight: 0.3, desc: "England & Wales governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?united\s+kingdom\b/i,                       code: "UK",         weight: 0.3, desc: "United Kingdom governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+ireland\b/i,                                           code: "IE",         weight: 0.3, desc: "Ireland governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+australia\b/i,                                         code: "AU",         weight: 0.3, desc: "Australian governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?new\s+south\s+wales\b/i, code: "AU-NSW",     weight: 0.3, desc: "NSW governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+(?:the\s+)?(?:state\s+of\s+)?victoria\b/i,             code: "AU-VIC",     weight: 0.3, desc: "Victoria governing law clause" },
  { pattern: /governed\s+by\s+(?:the\s+)?laws?\s+of\s+new\s+zealand\b/i,                                     code: "NZ",         weight: 0.3, desc: "New Zealand governing law clause" },

  // === LEGISLATION REFERENCES (0.3) ===
  { pattern: /employment\s+rights\s+act\s+1996\b/i,                    code: "UK",         weight: 0.3, desc: "Employment Rights Act 1996" },
  { pattern: /equality\s+act\s+2010\b/i,                                code: "UK",         weight: 0.3, desc: "Equality Act 2010" },
  { pattern: /worker\s+protection\s+act\s+2023\b/i,                     code: "UK",         weight: 0.3, desc: "Worker Protection Act 2023" },
  { pattern: /fair\s+work\s+act\s+2009\b/i,                             code: "AU",         weight: 0.3, desc: "Fair Work Act 2009" },
  { pattern: /national\s+employment\s+standards\b/i,                    code: "AU",         weight: 0.3, desc: "National Employment Standards" },
  { pattern: /canada\s+labour\s+code\b/i,                               code: "CA-federal", weight: 0.3, desc: "Canada Labour Code" },
  { pattern: /working\s+for\s+workers\s+act\b/i,                        code: "CA-ON",      weight: 0.3, desc: "Working for Workers Act" },
  { pattern: /employment\s+standards\s+act\s+2000\b/i,                  code: "CA-ON",      weight: 0.3, desc: "Employment Standards Act 2000 (Ontario)" },
  { pattern: /employment\s+standards\s+code\b/i,                        code: "CA-AB",      weight: 0.3, desc: "Employment Standards Code (Alberta)" },
  { pattern: /employment\s+relations\s+act\s+2000\b/i,                  code: "NZ",         weight: 0.3, desc: "Employment Relations Act 2000" },
  { pattern: /workplace\s+relations\s+commission\b/i,                   code: "IE",         weight: 0.3, desc: "Workplace Relations Commission" },
  { pattern: /california\s+business\s+and\s+professions\s+code\b/i,     code: "US-CA",      weight: 0.3, desc: "California Business and Professions Code" },
  { pattern: /\bB&P\s+Code\s+16600\b/i,                                 code: "US-CA",      weight: 0.3, desc: "B&P Code 16600" },
  { pattern: /california\s+labor\s+code\s+2870\b/i,                     code: "US-CA",      weight: 0.3, desc: "California Labor Code 2870" },
  { pattern: /freedom\s+to\s+work\s+act\b/i,                            code: "US-IL",      weight: 0.3, desc: "Freedom to Work Act (Illinois)" },
  { pattern: /\bfla\.\s*stat\.\s*542\b/i,                               code: "US-FL",      weight: 0.3, desc: "Fla. Stat. 542" },
  { pattern: /florida\s+statutes?\s*[,§]\s*542\b/i,                     code: "US-FL",      weight: 0.3, desc: "Florida Statutes 542" },
  { pattern: /covenants?\s+not\s+to\s+compete\s+act\b/i,                code: "US-TX",      weight: 0.3, desc: "Covenants Not to Compete Act (Texas)" },
  { pattern: /employment\s+equality\s+acts?\s+1998/i,                   code: "IE",         weight: 0.3, desc: "Employment Equality Acts 1998 (Ireland)" },
  { pattern: /unfair\s+dismissals\s+act\s+1977\b/i,                     code: "IE",         weight: 0.3, desc: "Unfair Dismissals Act 1977 (Ireland)" },
  { pattern: /payment\s+of\s+wages\s+act\s+1991\b/i,                    code: "IE",         weight: 0.3, desc: "Payment of Wages Act 1991 (Ireland)" },
  { pattern: /holidays\s+act\s+2003\b/i,                                code: "NZ",         weight: 0.3, desc: "Holidays Act 2003 (New Zealand)" },

  // === CURRENCY SIGNALS (0.15) ===
  { pattern: /£\s*\d[\d,]*(?:\.\d{2})?/,                                code: "UK",         weight: 0.15, desc: "GBP (£)" },
  { pattern: /\bCAD\b|\bC\$\s*\d/,                                       code: "CA-federal", weight: 0.15, desc: "Canadian dollar" },
  { pattern: /\bAUD\b|\bA\$\s*\d/,                                       code: "AU",         weight: 0.15, desc: "Australian dollar" },

  // === POSTCODE / ADDRESS PATTERNS (0.15) ===
  { pattern: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/,                  code: "UK",         weight: 0.15, desc: "UK postcode" },
  { pattern: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/,                            code: "CA-federal", weight: 0.15, desc: "Canadian postal code" },
  { pattern: /\b(?:NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+\d{4}\b/,           code: "AU",         weight: 0.15, desc: "Australian state + postcode" },
  { pattern: /\b[DE]\d{2}\s?[A-Z0-9]{4}\b/,                             code: "IE",         weight: 0.15, desc: "Irish Eircode" },
  { pattern: /\bDublin\s+\d{1,2}\b/i,                                    code: "IE",         weight: 0.15, desc: "Dublin address" },

  // === COURT / TRIBUNAL REFERENCES (0.15) ===
  { pattern: /\bemployment\s+tribunal\b/i,                               code: "UK",         weight: 0.15, desc: "Employment Tribunal (UK)" },
  { pattern: /\bemployment\s+appeal\s+tribunal\b/i,                      code: "UK",         weight: 0.15, desc: "Employment Appeal Tribunal (UK)" },
  { pattern: /\bfair\s+work\s+commission\b/i,                            code: "AU",         weight: 0.15, desc: "Fair Work Commission" },
  { pattern: /\bontario\s+superior\s+court\b/i,                          code: "CA-ON",      weight: 0.15, desc: "Ontario Superior Court" },
  { pattern: /\bontario\s+court\s+of\s+justice\b/i,                      code: "CA-ON",      weight: 0.15, desc: "Ontario Court of Justice" },
  { pattern: /\bsuperior\s+court\s+of\s+justice\s+of\s+ontario\b/i,     code: "CA-ON",      weight: 0.15, desc: "Superior Court of Justice of Ontario" },
  { pattern: /\bsupreme\s+court\s+of\s+british\s+columbia\b/i,           code: "CA-BC",      weight: 0.15, desc: "Supreme Court of British Columbia" },
  { pattern: /\bcourt\s+of\s+(?:queen|king)'?s?\s+bench\b/i,             code: "CA-AB",      weight: 0.15, desc: "Court of Queen's/King's Bench" },
  { pattern: /\bhigh\s+court\s+of\s+new\s+zealand\b/i,                   code: "NZ",         weight: 0.15, desc: "High Court of New Zealand" },
  { pattern: /\bemployment\s+court\s+of\s+new\s+zealand\b/i,             code: "NZ",         weight: 0.15, desc: "Employment Court of New Zealand" },
  { pattern: /\bworkplace\s+relations\s+commission\b/i,                   code: "IE",         weight: 0.15, desc: "Workplace Relations Commission" },

  // === TAX REFERENCES (0.15) ===
  { pattern: /\bPAYE\b/,                                                  code: "UK",         weight: 0.15, desc: "PAYE (UK)" },
  { pattern: /\bnational\s+insurance\b/i,                                 code: "UK",         weight: 0.15, desc: "National Insurance (UK)" },
  { pattern: /\bNICs?\b/,                                                  code: "UK",         weight: 0.15, desc: "NICs (UK)" },
  { pattern: /\bIR35\b/,                                                   code: "UK",         weight: 0.15, desc: "IR35 (UK)" },
  { pattern: /\bPRSI\b/,                                                   code: "IE",         weight: 0.15, desc: "PRSI (Ireland)" },
  { pattern: /\bsuperannuation\s+(?:guarantee|fund|contribution)\b/i,     code: "AU",         weight: 0.15, desc: "Superannuation Guarantee (AU)" },
  { pattern: /\bSGC\b|\bsuper\s+guarantee\b/i,                            code: "AU",         weight: 0.15, desc: "Super Guarantee (AU)" },
  { pattern: /\bABN\b(?:\s*\d{2})?/,                                      code: "AU",         weight: 0.15, desc: "ABN (Australia)" },
  { pattern: /\bPAYG\b/,                                                   code: "AU",         weight: 0.15, desc: "PAYG withholding (AU)" },
  { pattern: /\bCPP\b|\bcanada\s+pension\s+plan\b/i,                      code: "CA-federal", weight: 0.15, desc: "CPP (Canada)" },
  { pattern: /\bemployment\s+insurance\b|\bEI\s+(?:premium|benefit|deduction)\b/i, code: "CA-federal", weight: 0.15, desc: "EI (Canada)" },
  { pattern: /\bPAGA\b/,                                                   code: "US-CA",      weight: 0.15, desc: "PAGA (California)" },

  // === LOW CONFIDENCE SIGNALS (0.05) ===
  { pattern: /\b(?:labour|behaviour|colour|honour|favour|organisation|recognise|authorise)\b/i, code: "UK",         weight: 0.05, desc: "British spelling" },
  { pattern: /\bbank\s+holiday\b/i,                                        code: "UK",         weight: 0.05, desc: "Bank Holiday reference" },
  { pattern: /\bwaitangi\s+day\b/i,                                        code: "NZ",         weight: 0.05, desc: "Waitangi Day reference" },
  { pattern: /\baustralia\s+day\b/i,                                       code: "AU",         weight: 0.05, desc: "Australia Day reference" },
  { pattern: /\banzac\s+day\b/i,                                           code: "AU",         weight: 0.05, desc: "ANZAC Day reference" },
  { pattern: /\bcanada\s+day\b/i,                                          code: "CA-federal", weight: 0.05, desc: "Canada Day reference" },
  { pattern: /\bvictoria\s+day\b/i,                                        code: "CA-federal", weight: 0.05, desc: "Victoria Day reference" },
  { pattern: /\b(?:0?[1-9]|[12]\d|3[01])\/(?:0?[1-9]|1[0-2])\/\d{4}\b/, code: "UK",         weight: 0.05, desc: "DD/MM/YYYY date format" },
];

// ─── Jurisdiction metadata ─────────────────────────────────────────────────────

const JURISDICTION_NAMES: Record<string, { country: string; jurisdiction: string }> = {
  "US-federal": { country: "US", jurisdiction: "United States (Federal)" },
  "US-CA":      { country: "US", jurisdiction: "California" },
  "US-NY":      { country: "US", jurisdiction: "New York" },
  "US-TX":      { country: "US", jurisdiction: "Texas" },
  "US-FL":      { country: "US", jurisdiction: "Florida" },
  "US-IL":      { country: "US", jurisdiction: "Illinois" },
  "US-WA":      { country: "US", jurisdiction: "Washington State" },
  "CA-federal": { country: "CA", jurisdiction: "Canada (Federal)" },
  "CA-ON":      { country: "CA", jurisdiction: "Ontario" },
  "CA-BC":      { country: "CA", jurisdiction: "British Columbia" },
  "CA-AB":      { country: "CA", jurisdiction: "Alberta" },
  "UK":         { country: "UK", jurisdiction: "United Kingdom" },
  "IE":         { country: "IE", jurisdiction: "Ireland" },
  "AU":         { country: "AU", jurisdiction: "Australia (Federal)" },
  "AU-VIC":     { country: "AU", jurisdiction: "Victoria (Australia)" },
  "AU-NSW":     { country: "AU", jurisdiction: "New South Wales (Australia)" },
  "NZ":         { country: "NZ", jurisdiction: "New Zealand" },
};

export const SUPPORTED_JURISDICTION_CODES = Object.keys(JURISDICTION_NAMES);

export const JURISDICTION_DISPLAY_LIST = [
  { group: "🇺🇸 United States", items: [
    { code: "US-CA", label: "California" },
    { code: "US-NY", label: "New York" },
    { code: "US-TX", label: "Texas" },
    { code: "US-FL", label: "Florida" },
    { code: "US-IL", label: "Illinois" },
    { code: "US-WA", label: "Washington" },
    { code: "US-federal", label: "Federal / Other State" },
  ]},
  { group: "🇨🇦 Canada", items: [
    { code: "CA-ON", label: "Ontario" },
    { code: "CA-BC", label: "British Columbia" },
    { code: "CA-AB", label: "Alberta" },
    { code: "CA-federal", label: "Federal / Other Province" },
  ]},
  { group: "🌍 International", items: [
    { code: "UK",     label: "🇬🇧 United Kingdom" },
    { code: "IE",     label: "🇮🇪 Ireland" },
    { code: "AU",     label: "🇦🇺 Australia (Federal)" },
    { code: "AU-NSW", label: "🇦🇺 New South Wales" },
    { code: "AU-VIC", label: "🇦🇺 Victoria" },
    { code: "NZ",     label: "🇳🇿 New Zealand" },
  ]},
];

// ─── Detection ────────────────────────────────────────────────────────────────

const DEFAULT_RESULT: JurisdictionResult = {
  country:          "US",
  jurisdiction:     "United States (Federal)",
  jurisdictionCode: "US-federal",
  confidence:       0,
  signals:          [],
  candidates:       [{ jurisdictionCode: "US-federal", jurisdiction: "United States (Federal)", confidence: 0 }],
};

export function detectJurisdiction(contractText: string): JurisdictionResult {
  try {
    const text = contractText.slice(0, 8000);
    const scores: Record<string, number> = {};
    const firedSignals: string[] = [];

    for (const sig of SIGNALS) {
      if (sig.pattern.test(text)) {
        scores[sig.code] = Math.min(1.0, (scores[sig.code] ?? 0) + sig.weight);
        if (!firedSignals.includes(sig.desc)) firedSignals.push(sig.desc);
      }
    }

    const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (ranked.length === 0 || ranked[0][1] < 0.05) return DEFAULT_RESULT;

    const [topCode, topScore] = ranked[0];
    const meta = JURISDICTION_NAMES[topCode] ?? JURISDICTION_NAMES["US-federal"];

    const candidates = ranked.slice(0, 2).map(([code, conf]) => ({
      jurisdictionCode: code,
      jurisdiction:     JURISDICTION_NAMES[code]?.jurisdiction ?? code,
      confidence:       conf,
    }));

    // If score is below threshold, default to US-federal but keep signals for display
    if (topScore < 0.4) {
      return {
        ...DEFAULT_RESULT,
        confidence: topScore,
        signals:    firedSignals.slice(0, 5),
        candidates,
      };
    }

    return {
      country:          meta.country,
      jurisdiction:     meta.jurisdiction,
      jurisdictionCode: topCode,
      confidence:       topScore,
      signals:          firedSignals.slice(0, 5),
      candidates,
    };
  } catch {
    return DEFAULT_RESULT;
  }
}

// ─── Jurisdiction legal contexts ──────────────────────────────────────────────

const JURISDICTION_CONTEXTS: Record<string, string> = {
  "US-federal": `At-will employment default. FTC non-compete rule vacated August 2024, appeal dismissed September 2025, state law governs. NLRA protects salary discussion. Arbitration governed by FAA. FLSA sets minimum wage and overtime.`,

  "US-CA": `Non-competes void under B&P Code 16600. IP assignment limited by Labor Code 2870. Arbitration scrutinised under Armendariz. CFRA and PDLL leave protections. PAGA enforcement.`,

  "US-NY": `Non-competes under reasonableness test. Governor vetoed ban December 2023. Wage Theft Prevention Act. WARN Act notice requirements.`,

  "US-TX": `Covenants Not to Compete Act — must be ancillary to enforceable agreement. Blue-penciling permitted. Employer-friendly courts.`,

  "US-FL": `Fla. Stat. 542.335 — burden on employee to prove unreasonableness. Courts must enforce if facially reasonable. No consideration required post-hire.`,

  "US-IL": `Freedom to Work Act 2022 — non-competes void under $75,000, non-solicitation void under $45,000. 14-day review period required.`,

  "US-WA": `Non-competes void under $100,000 (CPI-adjusted). Must be disclosed pre-offer. Garden leave or equivalent required for enforcement.`,

  "CA-federal": `Canada Labour Code for federally regulated industries. Unjust dismissal after 12 months service. Reasonable notice on termination. Non-competes under common law reasonableness. Federal Budget 2025 proposed ban for federally regulated employers — under consultation, not yet law.`,

  "CA-ON": `Working for Workers Act 2022 — non-competes void for most employees signed after October 25 2021. Senior executive exception applies. Employment Standards Act 2000 sets minimum notice, severance, termination pay. Human Rights Code cannot be contracted out of.`,

  "CA-BC": `Employment Standards Act minimum standards. Common law reasonable notice applies — often exceeds statutory minimums significantly. Non-competes under strict reasonableness test. Courts historically skeptical.`,

  "CA-AB": `Employment Standards Code. Non-competes under reasonableness test. No statutory ban. Leading case: Shafron v KRG Insurance Brokers (SCC). Federal Labour Code changes may affect federally regulated Alberta workers if passed.`,

  "UK": `Employment Rights Act 1996. Equality Act 2010. Non-competes enforceable only if protecting legitimate business interest and reasonable in scope and duration. Restraint of trade doctrine applied strictly. Post-termination restrictions above 12 months face high scrutiny. IR35 for contractors. Worker Protection Act 2023. UK GDPR applies to data clauses. Settlement agreements require independent legal advice to bind.`,

  "IE": `Employment Equality Acts 1998-2015. Unfair Dismissals Act 1977. Non-competes under reasonableness test. Payment of Wages Act 1991. GDPR applies. Terms of Employment Information Act 1994 — written statement required within 5 days of start.`,

  "AU": `Fair Work Act 2009. National Employment Standards cannot be contracted out of — any clause attempting this is void. Non-competes under reasonableness test. Unfair dismissal after 6 months (12 for small business). Superannuation Guarantee cannot be waived. General protections — adverse action claims.`,

  "AU-VIC": `Fair Work Act 2009 and National Employment Standards as the federal baseline. Victorian Equal Opportunity Act 2010. Long Service Leave Act 2018. Non-competes under reasonableness test. Superannuation Guarantee cannot be waived.`,

  "AU-NSW": `Fair Work Act 2009 and National Employment Standards as the federal baseline. Anti-Discrimination Act 1977. Long Service Leave Act 1955. Non-competes under reasonableness test. Superannuation Guarantee cannot be waived.`,

  "NZ": `Employment Relations Act 2000. Good faith obligations on both parties — cannot be contracted out of. Non-competes under reasonableness test. Personal grievance for unjust dismissal. Holidays Act 2003 minimums cannot be waived. 90-day trial period for small employers.`,
};

export function getJurisdictionContext(jurisdictionCode: string): string {
  return JURISDICTION_CONTEXTS[jurisdictionCode] ?? JURISDICTION_CONTEXTS["US-federal"];
}

export function getJurisdictionName(jurisdictionCode: string): string {
  return JURISDICTION_NAMES[jurisdictionCode]?.jurisdiction ?? "United States (Federal)";
}
