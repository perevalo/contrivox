import { Suspense } from "react";
import type { Metadata } from "next";
import SuccessContent from "./SuccessContent";

export const metadata: Metadata = {
  title: "Analysing your contract — Contrivox",
  robots: { index: false },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <SuccessContent />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    </div>
  );
}
