"use client";

import { useEffect, useState } from "react";

export function BlogStickyBanner() {
  const [visible, setVisible]     = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => {
      if (dismissed) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      setVisible(window.scrollY / scrollable >= 0.3);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [dismissed]);

  return (
    <>
      <style>{`
        .cvx-blog-banner {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 60;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 62px;
          background: var(--cvx-bg);
          border-top: 1px solid var(--cvx-border);
        }
        @media (max-width: 767px) {
          .cvx-blog-banner { display: flex; }
        }
      `}</style>
      <div
        className="cvx-blog-banner"
        aria-hidden={!visible || dismissed}
        style={{
          transform: visible && !dismissed ? "translateY(0)" : "translateY(100%)",
          transition: "transform 220ms ease",
          pointerEvents: visible && !dismissed ? "auto" : "none",
        }}
      >
        <a
          href="/#upload-sec"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 42,
            fontSize: 14,
            fontWeight: 700,
            background: "var(--cvx-accent-grad)",
            color: "white",
            textDecoration: "none",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-accent)",
            letterSpacing: "0.01em",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          Understand your contract in 60&nbsp;seconds&nbsp;→&nbsp;Analyze&nbsp;Now
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            color: "var(--cvx-muted)",
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
            padding: "8px 4px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ×
        </button>
      </div>
    </>
  );
}
