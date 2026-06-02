interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 28, className }: LogoProps) {
  const width = Math.round((148 / 32) * height);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 148 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Contrivox"
      role="img"
      className={className}
      style={{ color: "var(--cvx-heading)" }}
    >
      <defs>
        <linearGradient id="cvx-icon-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#9333ea" />
          <stop offset="48%"  stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="cvx-icon-s" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity={0.22} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Icon mark — gradient rounded square */}
      <rect width="32" height="32" rx="7.5" fill="url(#cvx-icon-g)" />
      <rect width="32" height="32" rx="7.5" fill="url(#cvx-icon-s)" />

      {/* V lettermark */}
      <path
        d="M7 8 L16 23 L25 8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Accent bar below V tip */}
      <line
        x1="14" y1="26" x2="18" y2="26"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.45}
      />

      {/* Wordmark: Contri (medium) + vox (bold) */}
      <text
        x="43"
        y="22"
        fontFamily="'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="18"
        letterSpacing="-0.3"
        fill="currentColor"
      >
        <tspan fontWeight="500">Contri</tspan>
        <tspan fontWeight="700">vox</tspan>
      </text>
    </svg>
  );
}
