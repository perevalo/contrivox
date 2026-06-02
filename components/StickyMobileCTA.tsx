"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => {
      const el = document.getElementById("upload-sec");
      if (!el) { setVisible(false); return; }
      setVisible(el.getBoundingClientRect().bottom < 0);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);

  const scrollToUpload = () => {
    document.getElementById("upload-sec")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .cvx-sticky-cta {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          z-index: 50;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          background: var(--cvx-bg);
          border-top: 1px solid var(--cvx-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 200ms ease;
        }
        @media (max-width: 767px) {
          .cvx-sticky-cta { display: flex; }
        }
      `}</style>
      <div
        className="cvx-sticky-cta"
        aria-hidden={!visible}
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <button
          onClick={scrollToUpload}
          style={{
            padding: "0 32px",
            height: 44,
            fontSize: 15,
            fontWeight: 700,
            background: "var(--cvx-accent-grad)",
            color: "white",
            border: "none",
            borderRadius: "var(--r-lg)",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "var(--shadow-accent)",
            letterSpacing: "0.01em",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          Check My Contract — from $9
        </button>
      </div>
    </>
  );
}
