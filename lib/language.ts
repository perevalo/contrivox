export type LanguageResult = {
  language:    string;
  languageCode: string;
  confidence:  number;
  supported:   boolean;
};

// High-frequency, contract-specific terms that are distinctive per language.
// Using contract/legal vocabulary reduces false positives from proper nouns.
const FINGERPRINTS: Record<string, string[]> = {
  en: ["whereas", "hereby", "employment", "employee", "employer", "agreement", "termination", "confidential", "intellectual", "shall"],
  es: ["empleado", "empleador", "contrato", "empresa", "acuerdo", "rescisión", "confidencial", "vigencia", "cláusula", "mediante"],
  fr: ["employé", "employeur", "contrat", "accord", "entreprise", "résiliation", "confidentialité", "présent", "conformément", "clause"],
  pt: ["empregado", "empregador", "contrato", "empresa", "acordo", "rescisão", "confidencial", "termos", "mediante", "cláusula"],
  de: ["arbeitnehmer", "arbeitgeber", "vertrag", "vereinbarung", "unternehmen", "kündigung", "vertraulich", "klausel", "gemäß", "beschäftigung"],
  it: ["dipendente", "datore", "contratto", "accordo", "azienda", "risoluzione", "riservatezza", "clausola", "sensi", "lavoratore"],
  nl: ["werknemer", "werkgever", "overeenkomst", "onderneming", "beëindiging", "vertrouwelijk", "bepaling", "conform", "arbeidsovereenkomst"],
  pl: ["pracownik", "pracodawca", "umowa", "porozumienie", "przedsiębiorstwo", "rozwiązanie", "poufność", "klauzula", "strony", "zatrudnienie"],
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  pl: "Polish",
};

const DEFAULT_RESULT: LanguageResult = {
  language:     "English",
  languageCode: "en",
  confidence:   0,
  supported:    true,
};

export function detectLanguage(text: string): LanguageResult {
  try {
    const sample = text.slice(0, 2000).toLowerCase();
    const scores: Record<string, number> = {};

    for (const [code, words] of Object.entries(FINGERPRINTS)) {
      let hits = 0;
      for (const word of words) {
        // Whole-word matching (word boundaries may not work for all unicode, simple includes is enough here)
        if (sample.includes(word)) hits++;
      }
      if (hits > 0) scores[code] = hits / words.length;
    }

    const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (ranked.length === 0 || ranked[0][1] < 0.08) return DEFAULT_RESULT;

    const [topCode, topScore] = ranked[0];

    if (!(topCode in LANGUAGE_NAMES)) {
      return { ...DEFAULT_RESULT, confidence: topScore, supported: false };
    }

    return {
      language:     LANGUAGE_NAMES[topCode],
      languageCode: topCode,
      confidence:   topScore,
      supported:    true,
    };
  } catch {
    return DEFAULT_RESULT;
  }
}
