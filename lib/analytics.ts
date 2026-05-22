import posthog from "posthog-js";

// Typed event catalog — every PostHog event fired client-side goes through here.
// Import this module in client components only (posthog-js is browser-only).
export const Analytics = {
  // ── Acquisition ───────────────────────────────────────────────────────────
  ctaClicked: (location: "nav" | "hero" | "cta_band") =>
    posthog.capture("cta_clicked", { location }),

  // ── Upload funnel ─────────────────────────────────────────────────────────
  contractUploaded: (props: { file_type: string; file_size_kb: number }) =>
    posthog.capture("contract_uploaded", props),

  analysisStarted: (props: {
    file_type: string;
  }) => posthog.capture("analysis_started", props),

  analysisCompleted: (props: {
    score: number;
    score_label: string;
    contract_type: string;
    clause_count: number;
    red_flag_count: number;
    missing_count: number;
  }) => posthog.capture("analysis_completed", props),

  analysisErrored: (error: string) =>
    posthog.capture("analysis_error", { error }),

  // ── Lead capture ──────────────────────────────────────────────────────────
  emailCaptured: () => posthog.capture("email_captured"),
  whatsappCaptured: () => posthog.capture("whatsapp_captured"),

  // ── Paywall ───────────────────────────────────────────────────────────────
  previewShown: (props: { contract_type: string; high_risk_count: number }) =>
    posthog.capture("preview_shown", props),

  unlockClicked: () =>
    posthog.capture("unlock_clicked", { value: 9, currency: "USD" }),

  // ── Report delivery ───────────────────────────────────────────────────────
  reportSentEmail: () => posthog.capture("report_sent_email"),
  reportSentWhatsapp: () => posthog.capture("report_sent_whatsapp"),
  pdfDownloaded: () => posthog.capture("pdf_downloaded"),

  // ── Engagement ────────────────────────────────────────────────────────────
  tabSwitched: (props: { from: string; to: string }) =>
    posthog.capture("tab_switched", props),

  challengeViewed: (issue: string) =>
    posthog.capture("challenge_script_viewed", { issue }),

  faqOpened: (question: string) =>
    posthog.capture("faq_item_opened", { question }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  signInClicked: () => posthog.capture("signin_clicked"),

  signUpCompleted: (email: string) => {
    posthog.identify(email, { email, plan: "free" });
    posthog.capture("signup_completed");
  },

  signedOut: () => {
    posthog.capture("signed_out");
    posthog.reset();
  },
};
