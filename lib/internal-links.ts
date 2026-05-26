import type { ClauseRow } from "./seo-types";

// Injects <a> hyperlinks into plain-text content for the first occurrence of
// any other clause name or alias. Safe to call on AI-generated plain text fields
// (intro_paragraph, definition.plain_english, enforceability.overview).
// Returns HTML — render with dangerouslySetInnerHTML.
export function injectInternalLinks(
  text: string,
  currentSlug: string,
  allClauses: Pick<ClauseRow, "slug" | "name" | "also_known_as">[]
): string {
  // Build phrase → URL, skipping the current page's clause
  const phraseMap = new Map<string, string>();
  for (const clause of allClauses) {
    if (clause.slug === currentSlug) continue;
    const url = `/clauses/${clause.slug}`;
    phraseMap.set(clause.name.toLowerCase(), url);
    for (const alias of clause.also_known_as) {
      phraseMap.set(alias.toLowerCase(), url);
    }
  }

  // Longest phrases first to prefer specific matches over partial ones
  const phrases = [...phraseMap.keys()].sort((a, b) => b.length - a.length);

  const linkedSlugs = new Set<string>();
  let result = text;

  for (const phrase of phrases) {
    const url = phraseMap.get(phrase)!;
    const slug = url.replace("/clauses/", "");
    if (linkedSlugs.has(slug)) continue;

    // Only replace text that is NOT already inside an <a> tag
    const regex = new RegExp(`(?<!<[^>]*)\\b(${escapeRegex(phrase)})\\b`, "i");
    result = result.replace(regex, (match) => {
      linkedSlugs.add(slug);
      return `<a href="${url}" style="color:var(--cvx-accent);text-decoration:none;border-bottom:1px solid currentColor;opacity:0.85">${match}</a>`;
    });
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
