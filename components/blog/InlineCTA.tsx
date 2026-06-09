const HEADLINES: Record<string, string> = {
  "non-compete-fired":                  "Not sure if your non-compete holds up after being fired?",
  "ftc-non-compete-ban":                "Want to know if your non-compete is still enforceable?",
  "what-is-an-nda":                     "Have an NDA you need to understand fast?",
  "employment-contract-red-flags":      "Spotted a red flag in your contract?",
  "non-compete-enforceable-california": "Have a California non-compete you need checked?",
  "termination-clause-explained":       "Not sure what your termination clause actually means?",
  "does-non-compete-apply-if-fired":    "Just let go and worried about your non-compete?",
};

export function InlineCTA({ slug }: { slug: string }) {
  const headline = HEADLINES[slug] ?? "Not sure where you stand?";

  return (
    <div
      style={{
        margin: "28px 0",
        padding: "20px 24px",
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.28)",
        borderRadius: 14,
      }}
    >
      <p
        style={{
          fontFamily: "'Fraunces',serif",
          fontSize: 19,
          color: "var(--cvx-heading)",
          margin: "0 0 8px",
          lineHeight: 1.3,
        }}
      >
        {headline}
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--cvx-muted)",
          margin: "0 0 16px",
          lineHeight: 1.65,
        }}
      >
        Upload your contract — get a plain-English analysis of every restriction in under a minute.
      </p>
      <a
        href="/#upload-sec"
        style={{
          display: "inline-block",
          padding: "10px 22px",
          fontSize: 13,
          fontWeight: 700,
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          color: "white",
          textDecoration: "none",
          borderRadius: 9,
          letterSpacing: "0.01em",
        }}
      >
        Analyze My Contract
      </a>
    </div>
  );
}
