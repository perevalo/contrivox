const SITE = "https://contrivox.com";

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function definedTermSchema(clause: {
  name: string;
  plainEnglish: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: clause.name,
    description: clause.plainEnglish,
    url: `${SITE}/clauses/${clause.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Contrivox Legal Clause Glossary",
      url: `${SITE}/clauses`,
    },
  };
}
