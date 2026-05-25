import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Contrivox — AI contract analysis. Red flags, fairness score & negotiation scripts.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#09090f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple radial glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 600,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)",
          }}
        />
        {/* Red radial glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 400,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "64px 80px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 52 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
              }}
            >
              CV
            </div>
            <span style={{ fontSize: 32, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
              Contrivox
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              marginBottom: 28,
              maxWidth: 860,
            }}
          >
            Know exactly what
            <br />
            <span style={{ color: "#ef4444" }}>you&apos;re agreeing to.</span>
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: 24,
              color: "rgba(203,191,255,0.8)",
              lineHeight: 1.5,
              marginBottom: 48,
              maxWidth: 700,
            }}
          >
            AI reads every clause — red flags, fairness score, and
            negotiation scripts in 60 seconds.
          </div>

          {/* Pill badges */}
          <div style={{ display: "flex", gap: 14 }}>
            {[
              { text: "$9 one-time", color: "#7c3aed", bg: "rgba(124,58,237,0.18)", border: "rgba(124,58,237,0.4)" },
              { text: "60 seconds", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
              { text: "No subscription", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
            ].map((pill) => (
              <div
                key={pill.text}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: pill.bg,
                  border: `1.5px solid ${pill.border}`,
                  color: pill.color,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {pill.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            height: 5,
            background: "linear-gradient(90deg, #7c3aed, #4f46e5, #7c3aed)",
          }}
        />
      </div>
    ),
    size
  );
}
