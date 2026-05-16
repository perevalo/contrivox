import { useState, useEffect, useRef, useCallback } from "react";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    app_name: "Contrivox",
    app_tagline: "Your contract. Decoded.",
    nav_cta: "Analyse Contract", nav_signin: "Sign In", nav_history: "My Analyses", signout: "Sign out",
    hero_badge: "Don't sign what you don't understand",
    hero_h1a: "That contract could", hero_h1b: "cost you everything.",
    hero_sub: "Thousands of people sign contracts every day that strip their rights, hide fees, and trap them in clauses they never knew existed. Contrivox reads every word so you don't have to.",
    stat1v: "91%", stat1l: "admit signing without reading fully",
    stat2v: "68%", stat2l: "of contracts disadvantage the signer",
    stat3v: "$15k",  stat3l: "avg cost of an avoidable legal dispute",
    fear1t: "Hidden clauses that waive your rights",
    fear1b: "Buried in legal language are clauses that void your right to sue, waive overtime, or bind you to terms you never verbally agreed to.",
    fear2t: "Non-competes that follow you for years",
    fear2b: "One signature can ban you from your entire industry for 1–2 years. Most people only discover this after they've already signed.",
    fear3t: "Auto-renewals you never knew about",
    fear3b: "Contracts that charge you for years — hidden in sub-clauses nobody reads. Contrivox finds them before you sign.",
    upload_title: "Upload your contract", upload_formats: "PDF · PNG · JPG · DOCX · TXT — any language",
    upload_drop: "Tap or drop your contract here", upload_or: "tap to choose a file",
    out_lang: "Analysis language", analyse_btn: "Decode My Contract",
    contact_title: "Where should we send your report?",
    contact_sub: "We'll email you a copy of the full analysis automatically.",
    contact_email_label: "Email address", contact_email_ph: "your@email.com",
    contact_wa_label: "WhatsApp number", contact_wa_ph: "+1 555 000 0000",
    contact_wa_opt: "Optional — get a WhatsApp summary too",
    contact_privacy: "We never share your contact details. Used only to send your Contrivox report.",
    contact_email_required: "Email is required to send your report.",
    contact_email_invalid: "Please enter a valid email address.",
    auto_sent: "✓ Report sent to", auto_sending: "Sending your report…",
    analysing_msgs: ["Reading your contract…","Identifying all clauses…","Detecting red flags…","Building your Contrivox report…","Scoring fairness…","Almost done…"],
    results_title: "Contrivox Analysis", score_lbl: "Fairness score",
    tab_clauses: "Key Clauses", tab_flags: "Red Flags", tab_missing: "Missing Protections",
    preview_only: "Preview", showing: "showing", of: "of",
    blur_title: "Full analysis locked",
    blur_sub: "Unlock all clauses, every red flag, missing protections, negotiation scripts and your complete fairness score.",
    unlock_btn: "Unlock Full Report — $3.99",
    unlock_sub: "One-time · instant access · no subscription ever",
    deliver_title: "Receive your full report",
    deliver_sub: "Get the complete Contrivox PDF by email or WhatsApp",
    email_placeholder: "your@email.com", whatsapp_placeholder: "+1 555 000 0000",
    send_email: "Send to Email", send_wa: "Send via WhatsApp",
    sending: "Sending…", sent_email: "✓ Report sent to your email!", sent_wa: "✓ Sent via WhatsApp!",
    send_error: "Could not send. Please try again.",
    download_pdf: "⬇ Download PDF report",
    rec_title: "Recommendation", score_why: "Score reasoning",
    risk_high: "High risk", risk_med: "Medium", risk_low: "Low risk",
    challenge_btn: "How to challenge →", challenge_hide: "Hide",
    not_negotiable: "Non-negotiable", suggested: "Suggested approach",
    none_found: "None identified.",
    disclaimer: "⚠️ Contrivox is not a law firm and does not provide legal advice. This report is for educational and informational purposes only. Always consult a qualified lawyer before signing.",
    how_title: "How Contrivox works",
    how1t: "Upload your contract", how1b: "Any format, any language — PDF, image, or text",
    how2t: "AI reads every clause", how2b: "Advanced AI trained on thousands of legal documents",
    how3t: "Get your decoded report", how3b: "Plain-language scores, red flags, and negotiation scripts",
    test_title: "Real people. Real contracts. Real savings.",
    t1n: "Marcus T.", t1r: "Freelance designer, New York",
    t1t: "Found a clause that gave my client rights to ALL my future work. Saved myself years of regret for $3.99. Contrivox paid for itself a thousand times over.",
    t2n: "Priya S.", t2r: "Software engineer, London",
    t2t: "My offer letter had a non-compete covering the entire tech industry for 2 years. I renegotiated before signing. This would have cost me my next job.",
    t3n: "Camila R.", t3r: "Small business owner, São Paulo",
    t3t: "Auto rent-increase clause buried on page 8. Contrivox flagged it instantly. My lawyer confirmed it was completely one-sided.",
    faq_title: "Common questions",
    faq1q: "Is this legal advice?",
    faq1a: "No — and we're upfront about that. Contrivox is an educational tool that helps you understand what you're signing. Always consult a qualified lawyer for legal decisions.",
    faq2q: "What file types are supported?",
    faq2a: "PDF, JPG, PNG, GIF, WEBP, TXT, and DOCX. Contracts written in any language are supported — our AI reads them all and responds in your chosen language.",
    faq3q: "What happens after I pay?",
    faq3a: "You're redirected to your full Contrivox report instantly. No account required. No subscription. One payment, one complete decoded report.",
    faq4q: "Is my contract kept private?",
    faq4a: "Your contract is processed in memory and never stored on our servers without your consent. We take your privacy seriously.",
    faq5q: "Can I save my analyses?",
    faq5a: "Yes — create a free Contrivox account to save all your analyses and access them any time from your dashboard.",
    cta_band: "Know what you're signing before it's too late.",
    footer_copy: "© 2025 Contrivox",
    account_title: "My Analyses", account_empty: "No saved analyses yet. Upload a contract to get started.",
    account_date: "Analysed", account_view: "View report",
    account_signin_prompt: "Create a free account to save and revisit all your analyses.",
    signin_title: "Welcome to Contrivox", signin_email: "Email address", signin_pw: "Password",
    signin_btn: "Sign In", signup_btn: "Create free account", account_name: "Your name",
    modal_close: "Close", save_prompt: "Sign in to save this analysis to your account.",
    overall_rec: "Our recommendation", parties: "Parties", contract_type: "Contract type",
    score_label_map: { Fair:"Fair", Acceptable:"Acceptable", Concerning:"Concerning", Unfair:"Unfair", Dangerous:"Dangerous" },
  },
  pt: {
    app_name: "Contrivox",
    app_tagline: "Seu contrato. Desvendado.",
    nav_cta: "Analisar Contrato", nav_signin: "Entrar", nav_history: "Minhas Análises", signout: "Sair",
    hero_badge: "Não assine o que você não entende",
    hero_h1a: "Esse contrato pode", hero_h1b: "custar tudo que você tem.",
    hero_sub: "Milhares de pessoas assinam contratos todos os dias que removem seus direitos, escondem taxas e as prendem em cláusulas que nunca souberam existir. O Contrivox lê cada palavra para que você não precise.",
    stat1v: "91%", stat1l: "admitem assinar sem ler completamente",
    stat2v: "68%", stat2l: "dos contratos prejudicam quem assina",
    stat3v: "R$75k", stat3l: "custo médio de uma disputa jurídica evitável",
    fear1t: "Cláusulas ocultas que renunciam seus direitos",
    fear1b: "Enterradas no juridiquês estão cláusulas que anulam seu direito de processar, eliminam horas extras ou te vinculam a termos que nunca concordou verbalmente.",
    fear2t: "Não-concorrências que te seguem por anos",
    fear2b: "Uma assinatura pode banir você do seu setor por 1–2 anos. A maioria das pessoas só descobre isso depois de já ter assinado.",
    fear3t: "Renovações automáticas que você desconhecia",
    fear3b: "Contratos que cobram por anos — escondidos em subcláusulas que ninguém lê. O Contrivox encontra antes de você assinar.",
    upload_title: "Envie seu contrato", upload_formats: "PDF · PNG · JPG · DOCX · TXT — qualquer idioma",
    upload_drop: "Toque ou arraste seu contrato aqui", upload_or: "toque para escolher um arquivo",
    out_lang: "Idioma da análise", analyse_btn: "Desvendar Meu Contrato",
    contact_title: "Para onde enviamos seu relatório?",
    contact_sub: "Enviaremos automaticamente uma cópia da análise completa para o seu e-mail.",
    contact_email_label: "Endereço de e-mail", contact_email_ph: "seu@email.com",
    contact_wa_label: "Número do WhatsApp", contact_wa_ph: "+55 11 90000-0000",
    contact_wa_opt: "Opcional — receba também um resumo pelo WhatsApp",
    contact_privacy: "Nunca compartilhamos seus dados. Usados apenas para enviar seu relatório Contrivox.",
    contact_email_required: "E-mail é obrigatório para enviar seu relatório.",
    contact_email_invalid: "Por favor insira um endereço de e-mail válido.",
    auto_sent: "✓ Relatório enviado para", auto_sending: "Enviando seu relatório…",
    analysing_msgs: ["Lendo seu contrato…","Identificando todas as cláusulas…","Detectando alertas…","Construindo seu relatório Contrivox…","Calculando equidade…","Quase pronto…"],
    results_title: "Análise Contrivox", score_lbl: "Pontuação de equidade",
    tab_clauses: "Cláusulas", tab_flags: "Alertas", tab_missing: "Proteções Ausentes",
    preview_only: "Prévia", showing: "mostrando", of: "de",
    blur_title: "Análise completa bloqueada",
    blur_sub: "Desbloqueie todas as cláusulas, alertas, proteções ausentes, scripts de negociação e sua pontuação completa.",
    unlock_btn: "Desbloquear Relatório Completo — R$19,90",
    unlock_sub: "Pagamento único · acesso imediato · sem assinatura",
    deliver_title: "Receba seu relatório completo",
    deliver_sub: "Receba o PDF completo do Contrivox por e-mail ou WhatsApp",
    email_placeholder: "seu@email.com", whatsapp_placeholder: "+55 11 90000-0000",
    send_email: "Enviar por E-mail", send_wa: "Enviar pelo WhatsApp",
    sending: "Enviando…", sent_email: "✓ Relatório enviado para seu e-mail!", sent_wa: "✓ Enviado pelo WhatsApp!",
    send_error: "Não foi possível enviar. Tente novamente.",
    download_pdf: "⬇ Baixar relatório em PDF",
    rec_title: "Nossa recomendação", score_why: "Justificativa da pontuação",
    risk_high: "Alto risco", risk_med: "Médio", risk_low: "Baixo risco",
    challenge_btn: "Como contestar →", challenge_hide: "Ocultar",
    not_negotiable: "Inegociável", suggested: "Abordagem sugerida",
    none_found: "Nenhum identificado.",
    disclaimer: "⚠️ O Contrivox não é um escritório de advocacia e não presta consultoria jurídica. Este relatório tem finalidade educacional e informativa. Sempre consulte um advogado qualificado antes de assinar.",
    how_title: "Como o Contrivox funciona",
    how1t: "Envie seu contrato", how1b: "Qualquer formato, qualquer idioma — PDF, imagem ou texto",
    how2t: "IA lê cada cláusula", how2b: "IA avançada treinada em milhares de documentos jurídicos",
    how3t: "Receba seu relatório desvendado", how3b: "Pontuações em linguagem simples, alertas e scripts de negociação",
    test_title: "Pessoas reais. Contratos reais. Economia real.",
    t1n: "Marcos T.", t1r: "Designer freelancer, São Paulo",
    t1t: "Encontrei uma cláusula que daria ao meu cliente direitos sobre TODOS os meus trabalhos futuros. Evitei anos de arrependimento por R$19,90. O Contrivox se pagou mil vezes.",
    t2n: "Priya S.", t2r: "Engenheira de software, Lisboa",
    t2t: "Minha proposta de emprego tinha uma não-concorrência cobrindo todo o setor de tecnologia por 2 anos. Renegociei antes de assinar. Isso teria custado meu próximo emprego.",
    t3n: "Camila R.", t3r: "Empresária, Rio de Janeiro",
    t3t: "Cláusula de aumento automático de aluguel enterrada na página 8. O Contrivox sinalizou na hora. Meu advogado confirmou que era completamente unilateral.",
    faq_title: "Perguntas frequentes",
    faq1q: "Isso é consultoria jurídica?",
    faq1a: "Não — e somos transparentes sobre isso. O Contrivox é uma ferramenta educacional que ajuda você a entender o que está assinando. Sempre consulte um advogado qualificado para decisões jurídicas.",
    faq2q: "Quais formatos de arquivo são suportados?",
    faq2a: "PDF, JPG, PNG, GIF, WEBP, TXT e DOCX. Contratos em qualquer idioma são suportados — nossa IA lê todos e responde no idioma que você escolher.",
    faq3q: "O que acontece depois que eu pago?",
    faq3a: "Você é redirecionado instantaneamente para seu relatório completo. Sem necessidade de conta. Sem assinatura. Um pagamento, um relatório completo.",
    faq4q: "Meu contrato é mantido em sigilo?",
    faq4a: "Seu contrato é processado em memória e nunca armazenado em nossos servidores sem seu consentimento. Levamos sua privacidade a sério.",
    faq5q: "Posso salvar minhas análises?",
    faq5a: "Sim — crie uma conta gratuita no Contrivox para salvar todas as suas análises e acessá-las a qualquer momento pelo seu painel.",
    cta_band: "Saiba o que você está assinando antes que seja tarde demais.",
    footer_copy: "© 2025 Contrivox",
    account_title: "Minhas Análises", account_empty: "Nenhuma análise salva ainda. Envie um contrato para começar.",
    account_date: "Analisado", account_view: "Ver relatório",
    account_signin_prompt: "Crie uma conta gratuita para salvar e revisitar todas as suas análises.",
    signin_title: "Bem-vindo ao Contrivox", signin_email: "Endereço de e-mail", signin_pw: "Senha",
    signin_btn: "Entrar", signup_btn: "Criar conta gratuita", account_name: "Seu nome",
    modal_close: "Fechar", save_prompt: "Entre para salvar esta análise na sua conta.",
    overall_rec: "Nossa recomendação", parties: "Partes", contract_type: "Tipo de contrato",
    score_label_map: { Fair:"Justo", Acceptable:"Aceitável", Concerning:"Preocupante", Unfair:"Injusto", Dangerous:"Perigoso" },
  },
  es: {
    app_name: "Contrivox",
    app_tagline: "Tu contrato. Descifrado.",
    nav_cta: "Analizar Contrato", nav_signin: "Iniciar sesión", nav_history: "Mis Análisis", signout: "Cerrar sesión",
    hero_badge: "No firmes lo que no entiendes",
    hero_h1a: "Ese contrato puede", hero_h1b: "costarte todo.",
    hero_sub: "Miles de personas firman contratos cada día que eliminan sus derechos, ocultan cargos y las atrapan en cláusulas que nunca supieron que existían. Contrivox lee cada palabra para que tú no tengas que hacerlo.",
    stat1v: "91%", stat1l: "admite firmar sin leer completamente",
    stat2v: "68%", stat2l: "de los contratos perjudican al firmante",
    stat3v: "$12k",  stat3l: "costo promedio de una disputa legal evitable",
    fear1t: "Cláusulas ocultas que renuncian a tus derechos",
    fear1b: "Enterradas en el lenguaje legal hay cláusulas que anulan tu derecho a demandar, eliminan horas extra o te vinculan a términos que nunca aceptaste verbalmente.",
    fear2t: "No-competencias que te siguen durante años",
    fear2b: "Una firma puede prohibirte trabajar en tu industria por 1–2 años. La mayoría lo descubre solo después de haber firmado.",
    fear3t: "Renovaciones automáticas que no conocías",
    fear3b: "Contratos que te cobran durante años — ocultos en subcláusulas que nadie lee. Contrivox los encuentra antes de que firmes.",
    upload_title: "Sube tu contrato", upload_formats: "PDF · PNG · JPG · DOCX · TXT — cualquier idioma",
    upload_drop: "Toca o arrastra tu contrato aquí", upload_or: "toca para elegir un archivo",
    out_lang: "Idioma del análisis", analyse_btn: "Descifrar Mi Contrato",
    contact_title: "¿Dónde enviamos tu informe?",
    contact_sub: "Te enviaremos automáticamente una copia del análisis completo a tu email.",
    contact_email_label: "Dirección de email", contact_email_ph: "tu@email.com",
    contact_wa_label: "Número de WhatsApp", contact_wa_ph: "+34 600 000 000",
    contact_wa_opt: "Opcional — recibe también un resumen por WhatsApp",
    contact_privacy: "Nunca compartimos tus datos. Solo se usan para enviarte tu informe Contrivox.",
    contact_email_required: "El email es obligatorio para enviar tu informe.",
    contact_email_invalid: "Por favor ingresa una dirección de email válida.",
    auto_sent: "✓ Informe enviado a", auto_sending: "Enviando tu informe…",
    analysing_msgs: ["Leyendo tu contrato…","Identificando todas las cláusulas…","Detectando alertas…","Construyendo tu informe Contrivox…","Calculando equidad…","Casi listo…"],
    results_title: "Análisis Contrivox", score_lbl: "Puntuación de equidad",
    tab_clauses: "Cláusulas", tab_flags: "Alertas", tab_missing: "Protecciones Faltantes",
    preview_only: "Vista previa", showing: "mostrando", of: "de",
    blur_title: "Análisis completo bloqueado",
    blur_sub: "Desbloquea todas las cláusulas, alertas, protecciones faltantes, scripts de negociación y tu puntuación completa.",
    unlock_btn: "Desbloquear Informe Completo — $3.99",
    unlock_sub: "Único · acceso inmediato · sin suscripción",
    deliver_title: "Recibe tu informe completo",
    deliver_sub: "Obtén el PDF completo de Contrivox por email o WhatsApp",
    email_placeholder: "tu@email.com", whatsapp_placeholder: "+34 600 000 000",
    send_email: "Enviar por Email", send_wa: "Enviar por WhatsApp",
    sending: "Enviando…", sent_email: "✓ ¡Informe enviado a tu email!", sent_wa: "✓ ¡Enviado por WhatsApp!",
    send_error: "No se pudo enviar. Inténtalo de nuevo.",
    download_pdf: "⬇ Descargar informe PDF",
    rec_title: "Nuestra recomendación", score_why: "Justificación de puntuación",
    risk_high: "Alto riesgo", risk_med: "Medio", risk_low: "Bajo riesgo",
    challenge_btn: "Cómo impugnar →", challenge_hide: "Ocultar",
    not_negotiable: "No negociable", suggested: "Enfoque sugerido",
    none_found: "Ninguno identificado.",
    disclaimer: "⚠️ Contrivox no es un bufete de abogados y no proporciona asesoramiento legal. Este informe es solo para fines educativos e informativos. Consulta siempre a un abogado calificado antes de firmar.",
    how_title: "Cómo funciona Contrivox",
    how1t: "Sube tu contrato", how1b: "Cualquier formato, cualquier idioma — PDF, imagen o texto",
    how2t: "La IA lee cada cláusula", how2b: "IA avanzada entrenada en miles de documentos legales",
    how3t: "Recibe tu informe descifrado", how3b: "Puntuaciones en lenguaje sencillo, alertas y scripts de negociación",
    test_title: "Personas reales. Contratos reales. Ahorros reales.",
    t1n: "Marcos T.", t1r: "Diseñador freelance, Ciudad de México",
    t1t: "Encontré una cláusula que le daba a mi cliente derechos sobre TODO mi trabajo futuro. Me ahorré años de arrepentimiento por $3.99. Contrivox se pagó mil veces solo.",
    t2n: "Priya S.", t2r: "Ingeniera de software, Madrid",
    t2t: "Mi oferta de trabajo tenía una no-competencia que cubría toda la industria tech por 2 años. Renegocié antes de firmar. Esto habría costado mi próximo empleo.",
    t3n: "Camila R.", t3r: "Empresaria, Buenos Aires",
    t3t: "Cláusula de aumento automático de renta enterrada en la página 8. Contrivox la señaló al instante. Mi abogado confirmó que era completamente unilateral.",
    faq_title: "Preguntas frecuentes",
    faq1q: "¿Es asesoramiento legal?",
    faq1a: "No — y somos transparentes al respecto. Contrivox es una herramienta educativa que te ayuda a entender lo que estás firmando. Consulta siempre a un abogado calificado para decisiones legales.",
    faq2q: "¿Qué tipos de archivo son compatibles?",
    faq2a: "PDF, JPG, PNG, GIF, WEBP, TXT y DOCX. Se admiten contratos en cualquier idioma — nuestra IA los lee todos y responde en el idioma que elijas.",
    faq3q: "¿Qué pasa después de pagar?",
    faq3a: "Eres redirigido a tu informe completo al instante. Sin cuenta requerida. Sin suscripción. Un pago, un informe completo.",
    faq4q: "¿Mi contrato es privado?",
    faq4a: "Tu contrato se procesa en memoria y nunca se almacena en nuestros servidores sin tu consentimiento. Nos tomamos tu privacidad muy en serio.",
    faq5q: "¿Puedo guardar mis análisis?",
    faq5a: "Sí — crea una cuenta gratuita en Contrivox para guardar todos tus análisis y acceder a ellos en cualquier momento desde tu panel.",
    cta_band: "Sabe lo que firmas antes de que sea demasiado tarde.",
    footer_copy: "© 2025 Contrivox",
    account_title: "Mis Análisis", account_empty: "No hay análisis guardados aún. Sube un contrato para empezar.",
    account_date: "Analizado", account_view: "Ver informe",
    account_signin_prompt: "Crea una cuenta gratuita para guardar y revisar todos tus análisis.",
    signin_title: "Bienvenido a Contrivox", signin_email: "Dirección de email", signin_pw: "Contraseña",
    signin_btn: "Iniciar sesión", signup_btn: "Crear cuenta gratuita", account_name: "Tu nombre",
    modal_close: "Cerrar", save_prompt: "Inicia sesión para guardar este análisis en tu cuenta.",
    overall_rec: "Nuestra recomendación", parties: "Partes", contract_type: "Tipo de contrato",
    score_label_map: { Fair:"Justo", Acceptable:"Aceptable", Concerning:"Preocupante", Unfair:"Injusto", Dangerous:"Peligroso" },
  },
};

const OUT_LANGS = [
  { code:"en", label:"English" }, { code:"pt", label:"Português (BR)" },
  { code:"es", label:"Español" }, { code:"fr", label:"Français" },
  { code:"de", label:"Deutsch" }, { code:"it", label:"Italiano" },
  { code:"uk", label:"Українська" }, { code:"pl", label:"Polski" },
  { code:"ar", label:"العربية" }, { code:"zh", label:"中文" },
  { code:"ja", label:"日本語" }, { code:"ru", label:"Русский" },
];

const LANG_NAMES = {
  en:"English", pt:"Brazilian Portuguese", es:"Spanish", fr:"French",
  de:"German", it:"Italian", uk:"Ukrainian", pl:"Polish",
  ar:"Arabic", zh:"Chinese (Simplified)", ja:"Japanese", ru:"Russian",
};

function detectLang() {
  const l = (navigator.language||"en").toLowerCase();
  if (l.startsWith("pt")) return "pt";
  if (l.startsWith("es")) return "es";
  return "en";
}

// ─── Analytics ────────────────────────────────────────────────────────────────
const _fbq = (...a) => window.fbq && window.fbq(...a);
const _gtag = (...a) => window.gtag && window.gtag(...a);
function track(name, params={}) { _fbq("track", name, params); _gtag("event", name, params); }

// ─── Claude prompt ────────────────────────────────────────────────────────────
function buildPrompt(langCode) {
  const lang = LANG_NAMES[langCode] || "English";
  return `You are Contrivox, an expert contract analyst. You MUST write EVERY word of your response in ${lang} — including all JSON field values, titles, descriptions, labels, and the disclaimer. The only exception is the score_label field which must remain one of these exact English enum values: Fair, Acceptable, Concerning, Unfair, Dangerous.

Return ONLY a valid JSON object. No markdown fences, no text before or after the JSON:

{
  "contract_type": "string — type of contract written in ${lang}",
  "summary": "string — 3-sentence plain-language overview in ${lang} that a 16-year-old can understand",
  "parties": ["string in ${lang} — each party name or role"],
  "key_clauses": [
    {
      "title": "string in ${lang} — plain-language clause name",
      "plain_english": "string in ${lang} — what this means for the signer in simple terms",
      "risk_level": "low" | "medium" | "high",
      "risk_note": "string in ${lang} explaining the risk, or null if low"
    }
  ],
  "red_flags": [
    {
      "issue": "string in ${lang} — what the red flag is",
      "why_it_matters": "string in ${lang} — real-world impact on the signer",
      "challenge": "string in ${lang} — exact suggested wording or approach to negotiate this clause",
      "challengeable": true | false
    }
  ],
  "missing_protections": ["string in ${lang} — important clause this contract lacks"],
  "score": integer 0-100,
  "score_label": "Fair" | "Acceptable" | "Concerning" | "Unfair" | "Dangerous",
  "score_reasoning": "string in ${lang} — 2 sentences explaining the score",
  "overall_recommendation": "string in ${lang} — 2-3 sentences: should they sign, negotiate, or walk away?",
  "disclaimer": "string in ${lang} — legal disclaimer stating this is not legal advice"
}

Critical rules:
1. Every text value MUST be in ${lang}. Writing in any other language is a failure.
2. score_label must be one of the 5 English enum values exactly — it is used for colour coding only.
3. score below 40 for clearly one-sided contracts. score above 70 only for genuinely balanced contracts.
4. challengeable = false only for legally required or government-mandated clauses.
5. The challenge field must be a concrete, actionable negotiation script — not generic advice.
6. Plain language throughout — no legalese, no jargon.`;
}

// ─── File extraction ──────────────────────────────────────────────────────────
async function extractFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  return new Promise((res, rej) => {
    const r = new FileReader();
    if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
      r.onload = () => res({ type:"image", data:r.result.split(",")[1], mediaType:file.type });
      r.readAsDataURL(file);
    } else if (ext === "pdf") {
      r.onload = () => res({ type:"pdf", data:r.result.split(",")[1] });
      r.readAsDataURL(file);
    } else {
      r.onload = () => res({ type:"text", text:r.result });
      r.readAsText(file);
    }
    r.onerror = rej;
  });
}

// ─── Claude API ───────────────────────────────────────────────────────────────
async function callClaude(payload, langCode) {
  let messages;
  if (payload.type === "image") {
    messages = [{ role:"user", content:[
      { type:"image", source:{ type:"base64", media_type:payload.mediaType, data:payload.data }},
      { type:"text", text:"Analyse this contract document fully according to your instructions." }
    ]}];
  } else if (payload.type === "pdf") {
    messages = [{ role:"user", content:[
      { type:"document", source:{ type:"base64", media_type:"application/pdf", data:payload.data }},
      { type:"text", text:"Analyse this contract document fully according to your instructions." }
    ]}];
  } else {
    messages = [{ role:"user", content:`Analyse this contract:\n\n${payload.text}` }];
  }
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4096, system:buildPrompt(langCode), messages }),
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const d = await resp.json();
  const raw = d.content.map(b=>b.text||"").join("").replace(/```json\n?|\n?```/g,"").trim();
  return JSON.parse(raw);
}

// ─── PDF generator ────────────────────────────────────────────────────────────
async function generatePDF(result, t) {
  if (!window.jspdf) throw new Error("jsPDF not loaded");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=210, M=18, CW=W-M*2;
  let y=0;

  const scoreCol = { Fair:[34,197,94], Acceptable:[132,204,22], Concerning:[234,179,8], Unfair:[249,115,22], Dangerous:[239,68,68] };
  const sc = scoreCol[result.score_label]||[120,120,140];
  const riskCol = { high:[210,40,40], medium:[190,130,0], low:[30,140,80] };

  const nl = (h=5) => { y+=h; if(y>272){ doc.addPage(); y=20; }};
  const txt = (text, size=11, bold=false, color=[40,40,55], maxW=CW) => {
    doc.setFontSize(size); doc.setFont("helvetica", bold?"bold":"normal"); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text||""), maxW);
    if(y + lines.length*(size*0.38+1) > 272){ doc.addPage(); y=20; }
    doc.text(lines, M, y);
    y += lines.length*(size*0.38+1.5);
  };
  const section = (label) => {
    nl(5);
    doc.setFillColor(240,237,255); doc.roundedRect(M-3, y-5, CW+6, 11, 2, 2, "F");
    txt(label, 11, true, [70,50,170]);
    nl(3);
  };

  // Cover
  doc.setFillColor(9,9,20); doc.rect(0,0,W,42,"F");
  doc.setFillColor(...sc); doc.rect(0,38,W,4,"F");
  // Logo area
  doc.setFillColor(120,60,220); doc.roundedRect(M, 8, 24, 24, 4, 4, "F");
  doc.setFontSize(16); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("CV", M+6, 23);
  doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
  doc.text("Contrivox", M+28, 23);
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(180,160,255);
  doc.text(t.app_tagline, M+28, 31);
  // Score top right
  const scoreStr = `${result.score}/100 — ${t.score_label_map?.[result.score_label]||result.score_label}`;
  doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(...sc);
  doc.text(scoreStr, W-M, 20, { align:"right" });
  doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(160,150,200);
  doc.text(result.contract_type||"", W-M, 28, { align:"right" });

  y = 54;

  // Summary
  section(t.results_title);
  txt(result.summary, 10.5, false, [50,50,65]);
  nl(2);
  if(result.parties?.length) txt(`${t.parties}: ${result.parties.join(" · ")}`, 9, false, [110,100,130]);

  // Score box
  nl(6);
  doc.setFillColor(245,243,255); doc.roundedRect(M-3, y-4, CW+6, 26, 3, 3, "F");
  txt(t.score_why, 9, true, [90,70,170]);
  txt(result.score_reasoning, 10, false, [50,50,65]);
  nl(3);

  // Recommendation
  section(t.overall_rec);
  txt(result.overall_recommendation, 10.5, false, [50,50,65]);

  // Key clauses
  section(t.tab_clauses);
  (result.key_clauses||[]).forEach((c,i) => {
    if(y>258){ doc.addPage(); y=20; }
    const rc = riskCol[c.risk_level]||[100,100,110];
    const badge = `[${(c.risk_level||"").toUpperCase()}]`;
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...rc);
    doc.text(`${i+1}. ${badge}`, M, y);
    doc.setTextColor(30,30,45);
    const titleLines = doc.splitTextToSize(c.title||"", CW-20);
    doc.text(titleLines, M+18, y);
    y += Math.max(5, titleLines.length*4);
    txt(c.plain_english, 9.5, false, [65,65,80]);
    if(c.risk_note){ txt(`⚠ ${c.risk_note}`, 9, false, [180,55,55]); }
    nl(3);
  });

  // Red flags
  section(t.tab_flags);
  (result.red_flags||[]).forEach((f,i) => {
    if(y>258){ doc.addPage(); y=20; }
    doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(195,35,35);
    const issueLines = doc.splitTextToSize(`${i+1}. ${f.issue||""}`, CW);
    doc.text(issueLines, M, y); y += issueLines.length*4.5;
    txt(f.why_it_matters, 9.5, false, [65,65,80]);
    if(f.challengeable && f.challenge){
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(75,65,175);
      doc.text(`${t.suggested}:`, M, y); y+=4;
      txt(f.challenge, 9, false, [75,65,175]);
    }
    nl(4);
  });

  // Missing
  if(result.missing_protections?.length){
    section(t.tab_missing);
    result.missing_protections.forEach(m => { txt(`• ${m}`, 9.5, false, [65,65,80]); nl(1); });
  }

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(240,237,255); doc.rect(0,284,W,13,"F");
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(110,100,140);
    const disc = doc.splitTextToSize(result.disclaimer||t.disclaimer, CW);
    doc.text(disc[0]||"", M, 290);
    doc.setFontSize(8); doc.setTextColor(140,130,170);
    doc.text(`${i} / ${pages}`, W-M, 290, { align:"right" });
  }

  return doc.output("datauristring");
}

// ─── WhatsApp send ────────────────────────────────────────────────────────────
function openWhatsApp(phone, result, t) {
  const num = phone.replace(/\D/g,"");
  const score_translated = t.score_label_map?.[result.score_label] || result.score_label;
  const msg = `📋 *${t.app_name} — ${t.results_title}*\n\n` +
    `📄 ${result.contract_type}\n` +
    `⚖️ ${t.score_lbl}: *${result.score}/100 — ${score_translated}*\n\n` +
    `💡 ${result.overall_recommendation}\n\n` +
    `🔴 ${t.tab_flags}: ${result.red_flags?.length||0}\n` +
    `📌 ${t.tab_clauses}: ${result.key_clauses?.length||0}\n\n` +
    `_${t.disclaimer}_`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ─── Auto email send ──────────────────────────────────────────────────────────
// In production: POST to your /api/send-report { email, analysis, pdfBase64 }
// using SendGrid / Resend / AWS SES to send a branded HTML email with PDF attached.
// This demo opens mailto as a fallback so the flow is visible without a backend.
function autoSendEmail(email, result, t) {
  try {
    const subject = encodeURIComponent(`Contrivox — ${result.contract_type}`);
    const score_label = t.score_label_map?.[result.score_label] || result.score_label;
    const body = encodeURIComponent(
      `${t.results_title}\n` +
      `${"─".repeat(40)}\n\n` +
      `${t.contract_type}: ${result.contract_type}\n` +
      `${t.score_lbl}: ${result.score}/100 — ${score_label}\n\n` +
      `${t.score_why}:\n${result.score_reasoning}\n\n` +
      `${t.overall_rec}:\n${result.overall_recommendation}\n\n` +
      `${t.tab_flags}:\n` +
      (result.red_flags||[]).map((f,i)=>`${i+1}. ${f.issue}\n   ${f.why_it_matters}`).join("\n\n") +
      `\n\n${t.tab_missing}:\n` +
      (result.missing_protections||[]).map((m,i)=>`${i+1}. ${m}`).join("\n") +
      `\n\n${result.disclaimer}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  } catch(e) {
    console.error("Email send error:", e);
  }
}


const getAccount = () => { try{ return JSON.parse(localStorage.getItem("cvx_acc")||"null"); }catch{ return null; }};
const saveAccount = a => localStorage.setItem("cvx_acc", JSON.stringify(a));
const getHistory = () => { try{ return JSON.parse(localStorage.getItem("cvx_hist")||"[]"); }catch{ return []; }};
const pushHistory = entry => {
  const h = getHistory(); h.unshift(entry);
  localStorage.setItem("cvx_hist", JSON.stringify(h.slice(0,25)));
};

// ─── Paywall limits ───────────────────────────────────────────────────────────
const CLAUSE_PREVIEW  = 2;
const FLAG_PREVIEW    = 1;
const MISSING_PREVIEW = 2;

// ─── UI components ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#07070f",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  accent: "#8b5cf6",
  accentGrad: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  danger: "#ef4444",
  text: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.42)",
  faint: "rgba(255,255,255,0.16)",
};

function ContrivoxLogo({ size=22 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <svg width={size*1.4} height={size*1.4} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="9" fill="url(#lg)"/>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient></defs>
        <path d="M10 12h16M10 18h10M10 24h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="26" cy="24" r="4" fill="#ef4444"/>
        <path d="M24.5 24l1 1 2-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily:"'Fraunces',serif", fontSize:size, color:"white", letterSpacing:"-0.02em", fontWeight:600 }}>Contrivox</span>
    </div>
  );
}

function ScoreRing({ score, label, t }) {
  const r=46, c=2*Math.PI*r, dash=(score/100)*c;
  const col = score>=70?"#22c55e":score>=50?"#eab308":score>=30?"#f97316":"#ef4444";
  const translatedLabel = t.score_label_map?.[label] || label;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
        <circle cx="58" cy="58" r={r} fill="none" stroke={col} strokeWidth="9"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 58 58)"
          style={{ transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="58" y="52" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="'Fraunces',serif">{score}</text>
        <text x="58" y="70" textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="11" fontFamily="'DM Sans',sans-serif">/100</text>
      </svg>
      <span style={{ fontSize:11, fontWeight:700, color:col, letterSpacing:"0.09em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{translatedLabel}</span>
    </div>
  );
}

function Badge({ level, t }) {
  const m = {
    high: { bg:"rgba(239,68,68,0.14)",   c:"#f87171", l:t.risk_high },
    medium:{ bg:"rgba(234,179,8,0.13)",   c:"#fbbf24", l:t.risk_med  },
    low:  { bg:"rgba(34,197,94,0.12)",    c:"#4ade80", l:t.risk_low  },
  };
  const s = m[level]||m.low;
  return <span style={{ background:s.bg, color:s.c, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{s.l}</span>;
}

function ClauseCard({ clause, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.035)", border:`0.5px solid ${COLORS.border}`, borderRadius:10, marginBottom:7, overflow:"hidden" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", cursor:"pointer", gap:9, background:"none", border:"none", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <Badge level={clause.risk_level} t={t}/>
          <span style={{ fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{clause.title}</span>
        </div>
        <span style={{ color:COLORS.faint, fontSize:18, flexShrink:0 }}>{open?"−":"+"}</span>
      </button>
      {open && (
        <div style={{ padding:"0 14px 13px", borderTop:`0.5px solid rgba(255,255,255,0.05)` }}>
          <p style={{ margin:"10px 0 0", fontSize:13, lineHeight:1.72, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{clause.plain_english}</p>
          {clause.risk_note && (
            <div style={{ marginTop:8, padding:"8px 11px", background:"rgba(239,68,68,0.07)", borderLeft:"2px solid rgba(239,68,68,0.35)", borderRadius:"0 6px 6px 0" }}>
              <p style={{ margin:0, fontSize:12, color:"#f87171", fontFamily:"'DM Sans',sans-serif" }}>{clause.risk_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlagCard({ flag, t }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ background:"rgba(239,68,68,0.04)", border:"0.5px solid rgba(239,68,68,0.16)", borderRadius:10, padding:"13px 14px", marginBottom:7 }}>
      <p style={{ margin:"0 0 5px", fontSize:13, fontWeight:600, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>{flag.issue}</p>
      <p style={{ margin:0, fontSize:12.5, color:COLORS.muted, lineHeight:1.68, fontFamily:"'DM Sans',sans-serif" }}>{flag.why_it_matters}</p>
      {flag.challengeable ? (
        <>
          <button onClick={()=>setShow(s=>!s)} style={{ marginTop:10, padding:"5px 12px", fontSize:11, fontWeight:700, background:show?"rgba(99,102,241,0.22)":"rgba(99,102,241,0.1)", color:"#a5b4fc", border:"0.5px solid rgba(99,102,241,0.22)", borderRadius:7, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}>
            {show ? t.challenge_hide : t.challenge_btn}
          </button>
          {show && (
            <div style={{ marginTop:9, padding:"11px 13px", background:"rgba(99,102,241,0.08)", border:"0.5px solid rgba(99,102,241,0.18)", borderRadius:9 }}>
              <p style={{ margin:"0 0 5px", fontSize:10, fontWeight:700, color:"#818cf8", letterSpacing:"0.09em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{t.suggested}</p>
              <p style={{ margin:0, fontSize:12.5, color:"rgba(200,190,255,0.85)", lineHeight:1.68, fontFamily:"'DM Sans',sans-serif" }}>{flag.challenge}</p>
            </div>
          )}
        </>
      ) : (
        <span style={{ display:"inline-block", marginTop:8, fontSize:10, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.not_negotiable}</span>
      )}
    </div>
  );
}

function PaywallOverlay({ t, onUnlock }) {
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, top:"25%", background:"linear-gradient(to bottom, rgba(7,7,15,0) 0%, rgba(7,7,15,0.97) 26%)", borderRadius:"0 0 14px 14px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", paddingBottom:28, zIndex:10 }}>
      <div style={{ textAlign:"center", padding:"0 20px" }}>
        <div style={{ fontSize:28, marginBottom:10 }}>🔒</div>
        <p style={{ fontSize:16, fontWeight:600, color:"white", margin:"0 0 8px", fontFamily:"'Fraunces',serif" }}>{t.blur_title}</p>
        <p style={{ fontSize:12.5, color:COLORS.muted, maxWidth:290, margin:"0 auto 18px", lineHeight:1.62, fontFamily:"'DM Sans',sans-serif" }}>{t.blur_sub}</p>
        <button onClick={onUnlock} style={{ padding:"13px 26px", fontSize:14, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 24px rgba(99,102,241,0.44)", letterSpacing:"0.01em" }}>
          {t.unlock_btn}
        </button>
        <p style={{ marginTop:9, fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.unlock_sub}</p>
      </div>
    </div>
  );
}

function DeliveryPanel({ result, t, uiLang, pdfUri }) {
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [emailSt, setEmailSt] = useState("idle");
  const [waSt, setWaSt] = useState("idle");

  const inp = { background:"rgba(255,255,255,0.055)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"10px 13px", color:"white", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", transition:"border-color .15s" };
  const btn = (grad, disabled) => ({ padding:"10px 16px", fontSize:12.5, fontWeight:700, background:disabled?"rgba(255,255,255,0.05)":grad, color:disabled?COLORS.faint:"white", border:"none", borderRadius:9, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s" });

  const doEmail = () => {
    if(!email||emailSt==="sending") return;
    setEmailSt("sending");
    track("DeliverEmail", { method:"email" });
    setTimeout(()=>{
      const sub = encodeURIComponent(`Contrivox — ${result.contract_type}`);
      const body = encodeURIComponent(`${t.rec_title}:\n${result.overall_recommendation}\n\n${t.score_lbl}: ${result.score}/100 — ${result.score_label_map?.[result.score_label]||result.score_label}\n\n${t.disclaimer}`);
      window.open(`mailto:${email}?subject=${sub}&body=${body}`, "_blank");
      setEmailSt("sent");
    }, 800);
  };

  const doWa = () => {
    if(!wa||waSt==="sending") return;
    setWaSt("sending");
    track("DeliverWhatsApp", { method:"whatsapp" });
    setTimeout(()=>{ openWhatsApp(wa, result, t); setWaSt("sent"); }, 500);
  };

  return (
    <div style={{ background:"rgba(99,102,241,0.05)", border:"0.5px solid rgba(99,102,241,0.2)", borderRadius:16, padding:"20px", marginBottom:14 }}>
      <p style={{ fontSize:14, fontWeight:600, color:"white", margin:"0 0 3px", fontFamily:"'Fraunces',serif" }}>{t.deliver_title}</p>
      <p style={{ fontSize:12, color:COLORS.muted, margin:"0 0 16px", fontFamily:"'DM Sans',sans-serif" }}>{t.deliver_sub}</p>
      <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
        <input style={inp} type="email" placeholder={t.email_placeholder} value={email} onChange={e=>setEmail(e.target.value)}/>
        <button style={btn(COLORS.accentGrad, !email)} onClick={doEmail} disabled={!email}>
          {emailSt==="sending"?t.sending:emailSt==="sent"?t.sent_email:t.send_email}
        </button>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <input style={inp} type="tel" placeholder={t.whatsapp_placeholder} value={wa} onChange={e=>setWa(e.target.value)}/>
        <button style={btn("linear-gradient(135deg,#16a34a,#15803d)", !wa)} onClick={doWa} disabled={!wa}>
          {waSt==="sending"?t.sending:waSt==="sent"?t.sent_wa:t.send_wa}
        </button>
      </div>
      {pdfUri && (
        <a href={pdfUri} download="Contrivox-Report.pdf" style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:13, fontSize:12, color:"rgba(167,139,250,0.75)", fontFamily:"'DM Sans',sans-serif", textDecoration:"underline" }}>
          {t.download_pdf}
        </a>
      )}
    </div>
  );
}

function AuthModal({ t, onClose, onAuth }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const inp = { display:"block", width:"100%", background:"rgba(255,255,255,0.06)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"11px 13px", color:"white", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:10 };
  const submit = () => {
    if(!email) return;
    const acc = { name:name||email.split("@")[0], email, createdAt:Date.now() };
    saveAccount(acc); onAuth(acc); onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"30px 26px", width:"100%", maxWidth:380, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:18, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
        <ContrivoxLogo size={18}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"white", margin:"16px 0 20px" }}>{t.signin_title}</h2>
        {mode==="signup" && <input style={inp} placeholder={t.account_name} value={name} onChange={e=>setName(e.target.value)}/>}
        <input style={inp} type="email" placeholder={t.signin_email} value={email} onChange={e=>setEmail(e.target.value)}/>
        <input style={inp} type="password" placeholder={t.signin_pw} value={pw} onChange={e=>setPw(e.target.value)}/>
        <button onClick={submit} style={{ width:"100%", padding:"12px", fontSize:14, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>
          {mode==="signin"?t.signin_btn:t.signup_btn}
        </button>
        <button onClick={()=>setMode(m=>m==="signin"?"signup":"signin")} style={{ width:"100%", background:"none", border:"none", color:"rgba(167,139,250,0.65)", cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
          {mode==="signin"?t.signup_btn:t.signin_btn}
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ t, account, onClose, onLoad }) {
  const history = getHistory();
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:1000, display:"flex", alignItems:"stretch", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f", borderLeft:`0.5px solid ${COLORS.border}`, padding:"26px 22px", width:"100%", maxWidth:420, overflowY:"auto", position:"relative", display:"flex", flexDirection:"column", gap:0 }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:20, background:"none", border:"none", color:COLORS.faint, cursor:"pointer", fontSize:22 }}>×</button>
        <ContrivoxLogo size={16}/>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"white", margin:"16px 0 4px" }}>{t.account_title}</h2>
        <p style={{ fontSize:11, color:COLORS.muted, marginBottom:22, fontFamily:"'DM Sans',sans-serif" }}>{account?.email}</p>
        {history.length===0 ? (
          <p style={{ fontSize:13, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{t.account_empty}</p>
        ) : history.map((item, i) => {
          const scCol = {Fair:"#22c55e",Acceptable:"#84cc16",Concerning:"#eab308",Unfair:"#f97316",Dangerous:"#ef4444"};
          const sc2 = scCol[item.score_label]||"#aaa";
          return (
            <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:`0.5px solid ${COLORS.border}`, borderRadius:11, padding:"13px 15px", marginBottom:9, display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.contract_type}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                  <span style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{t.account_date}: {new Date(item.savedAt).toLocaleDateString()}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:sc2, fontFamily:"'DM Sans',sans-serif" }}>{item.score}/100</span>
                </div>
              </div>
              <button onClick={()=>{ onLoad(item); onClose(); }} style={{ padding:"6px 13px", fontSize:11.5, fontWeight:600, background:"rgba(139,92,246,0.14)", color:"#a78bfa", border:"0.5px solid rgba(139,92,246,0.22)", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0 }}>{t.account_view}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:`0.5px solid ${COLORS.border}`, padding:"17px 0" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0, gap:12 }}>
        <span style={{ fontSize:14, fontWeight:500, color:COLORS.text, fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ color:COLORS.faint, fontSize:20, flexShrink:0, transition:"transform .2s", transform:open?"rotate(45deg)":"rotate(0)" }}>+</span>
      </button>
      {open && <p style={{ marginTop:10, fontSize:13, color:COLORS.muted, lineHeight:1.72, fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Contrivox() {
  const [uiLang, setUiLang]         = useState("en");
  const [outLang, setOutLang]       = useState("en");
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [loadMsg, setLoadMsg]       = useState("");
  const [result, setResult]         = useState(null);
  const [tab, setTab]               = useState("clauses");
  const [error, setError]           = useState(null);
  const [unlocked, setUnlocked]     = useState(false);
  const [pdfUri, setPdfUri]         = useState(null);
  const [account, setAccount]       = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [showHist, setShowHist]     = useState(false);
  const [pdfReady, setPdfReady]     = useState(false);
  // Contact collection
  const [contactEmail, setContactEmail] = useState("");
  const [contactWa, setContactWa]       = useState("");
  const [contactError, setContactError] = useState(null);
  const [autoSentTo, setAutoSentTo]     = useState(null);
  const fileRef    = useRef();
  const resultsRef = useRef();
  const t = T[uiLang] || T.en;

  useEffect(()=>{
    const l = detectLang();
    setUiLang(l); setOutLang(l);
    setAccount(getAccount());

    // jsPDF
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    js.onload = () => setPdfReady(true);
    document.head.appendChild(js);

    // GA4
    const gs = document.createElement("script");
    gs.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"; gs.async=true;
    document.head.appendChild(gs);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag("js",new Date()); window.gtag("config","G-XXXXXXXXXX"); // ← replace with GA4 ID

    // Facebook Pixel
    !function(f,b,e,v,n,tt,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];tt=b.createElement(e);tt.async=!0;tt.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(tt,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init","XXXXXXXXXXXXXXXXX"); // ← replace with Pixel ID
    window.fbq("track","PageView");
  },[]);

  // Build PDF whenever result is ready
  useEffect(()=>{
    if(!result||!pdfReady) return;
    generatePDF(result,t).then(setPdfUri).catch(e=>console.error("PDF error",e));
  },[result, pdfReady]);

  const handleFile = useCallback((f)=>{
    if(!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if(!["pdf","png","jpg","jpeg","gif","webp","txt","doc","docx"].includes(ext)){ setError("Unsupported file type."); return; }
    if(f.size>20*1024*1024){ setError("File too large. Max 20MB."); return; }
    setFile(f); setError(null); setResult(null); setUnlocked(false); setPdfUri(null);
    track("ContractUploaded",{ file_type:ext });
  },[]);

  const onDrop = useCallback((e)=>{ e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); },[handleFile]);

  const analyse = async () => {
    if(!file) return;

    // Validate email
    const emailTrimmed = contactEmail.trim();
    if(!emailTrimmed) { setContactError(t.contact_email_required); return; }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    if(!emailValid) { setContactError(t.contact_email_invalid); return; }
    setContactError(null);

    setLoading(true); setError(null); setResult(null); setUnlocked(false); setPdfUri(null); setAutoSentTo(null);
    const msgs = t.analysing_msgs;
    let mi=0; setLoadMsg(msgs[0]);
    const iv = setInterval(()=>{ mi=Math.min(mi+1,msgs.length-1); setLoadMsg(msgs[mi]); },2800);
    try {
      const payload = await extractFile(file);
      const analysis = await callClaude(payload, outLang);
      setResult(analysis); setTab("clauses");
      track("AnalysisComplete",{ score:analysis.score, contract_type:analysis.contract_type });
      if(account) pushHistory({ ...analysis, savedAt:Date.now(), fileName:file.name });

      // Auto-send via email (mailto fallback — replace with real API in production)
      autoSendEmail(emailTrimmed, analysis, t);
      setAutoSentTo(emailTrimmed);

      // Auto-send WhatsApp summary if number provided
      const waTrimmed = contactWa.trim();
      if(waTrimmed) {
        setTimeout(()=>openWhatsApp(waTrimmed, analysis, t), 800);
      }

      setTimeout(()=>resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }),250);
    } catch(e) {
      setError("Analysis failed: "+e.message);
      track("AnalysisError",{ error:e.message });
    } finally {
      clearInterval(iv); setLoading(false);
    }
  };

  const handleUnlock = () => {
    track("InitiateCheckout",{ value:3.99, currency:"USD", content_name:"full_contract_analysis" });
    // Production: POST /api/checkout → redirect to Stripe session
    window.open("https://buy.stripe.com/your_payment_link","_blank");
    // DEMO: simulate unlock after redirect — remove in production
    setTimeout(()=>{ setUnlocked(true); track("Purchase",{ value:3.99, currency:"USD" }); },2000);
  };

  function renderPaywalled(items, limit, renderFn) {
    if(!items?.length) return <p style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:"20px 0", fontFamily:"'DM Sans',sans-serif" }}>{t.none_found}</p>;
    const preview = items.slice(0, limit);
    const locked  = items.slice(limit);
    return (
      <div>
        {preview.map((item,i) => renderFn(item,i))}
        {!unlocked && locked.length > 0 && (
          <div style={{ position:"relative", minHeight:220 }}>
            <div style={{ filter:"blur(5px)", pointerEvents:"none", userSelect:"none", opacity:0.5 }}>
              {locked.map((item,i) => renderFn(item, i+limit))}
            </div>
            <PaywallOverlay t={t} onUnlock={handleUnlock}/>
          </div>
        )}
        {unlocked && locked.map((item,i) => renderFn(item, i+limit))}
      </div>
    );
  }

  const tabBtn = (k, label) => (
    <button key={k} onClick={()=>setTab(k)} style={{ flex:1, padding:"7px 6px", fontSize:12, fontWeight:500, cursor:"pointer", borderRadius:9, border:"none", fontFamily:"'DM Sans',sans-serif", background:tab===k?"rgba(255,255,255,0.1)":"transparent", color:tab===k?COLORS.text:COLORS.muted, transition:"all .15s" }}>{label}</button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${COLORS.bg};font-family:'DM Sans',sans-serif; -webkit-text-size-adjust:100%;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
        select,input,button{font-family:'DM Sans',sans-serif;}
        select option{background:#1a1a2e;color:white;}
        input::placeholder{color:rgba(255,255,255,0.26);}
        input:focus{border-color:rgba(139,92,246,0.45)!important;outline:none;}
        /* Mobile tap improvements */
        button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        @media(max-width:640px){
          nav{padding:0 14px!important;}
          section{padding-left:14px!important;padding-right:14px!important;}
          .hero-stats{grid-template-columns:1fr 1fr!important;}
          .fear-grid{grid-template-columns:1fr!important;}
          .how-grid{grid-template-columns:1fr!important;}
          .test-grid{grid-template-columns:1fr!important;}
        }
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.2)}50%{box-shadow:0 0 35px rgba(139,92,246,0.45)}}
        .fear-card{transition:border-color .2s,transform .2s;}
        .fear-card:hover{border-color:rgba(239,68,68,0.32)!important;transform:translateY(-2px);}
        .how-card{transition:background .2s,transform .2s;}
        .how-card:hover{background:rgba(255,255,255,0.05)!important;transform:translateY(-2px);}
        .nav-link{transition:color .15s;}
        .nav-link:hover{color:white!important;}
      `}</style>

      {showAuth && <AuthModal t={t} onClose={()=>setShowAuth(false)} onAuth={acc=>{ setAccount(acc); track("SignUp",{}); }}/>}
      {showHist && <HistoryPanel t={t} account={account} onClose={()=>setShowHist(false)} onLoad={r=>{ setResult(r); setUnlocked(true); setTab("clauses"); setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth"}),200); }}/>}

      <div style={{ minHeight:"100vh", background:COLORS.bg, backgroundImage:"radial-gradient(ellipse 65% 38% at 50% -4%, rgba(109,40,217,0.22) 0%, transparent 55%), radial-gradient(ellipse 35% 25% at 90% 90%, rgba(239,68,68,0.07) 0%, transparent 50%)" }}>

        {/* NAV */}
        <nav style={{ position:"sticky", top:0, zIndex:90, backdropFilter:"blur(18px)", background:"rgba(7,7,15,0.84)", borderBottom:`0.5px solid ${COLORS.border}`, padding:"0 20px" }}>
          <div style={{ maxWidth:920, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
            <ContrivoxLogo size={19}/>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Language toggle */}
              <div style={{ display:"flex", gap:2, background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"3px" }}>
                {["en","pt","es"].map(l=>(
                  <button key={l} onClick={()=>setUiLang(l)} style={{ padding:"3px 9px", fontSize:11, fontWeight:600, border:"none", cursor:"pointer", borderRadius:6, fontFamily:"'DM Sans',sans-serif", background:uiLang===l?"rgba(255,255,255,0.13)":"transparent", color:uiLang===l?"white":COLORS.muted, transition:"all .15s" }}>{l.toUpperCase()}</button>
                ))}
              </div>
              {account ? (
                <>
                  <button onClick={()=>setShowHist(true)} className="nav-link" style={{ padding:"6px 13px", fontSize:12, fontWeight:500, background:"rgba(255,255,255,0.06)", color:COLORS.muted, border:`0.5px solid ${COLORS.border}`, borderRadius:8, cursor:"pointer" }}>{t.nav_history}</button>
                  <button onClick={()=>{ saveAccount(null); setAccount(null); }} className="nav-link" style={{ padding:"6px 10px", fontSize:12, background:"none", color:"rgba(255,255,255,0.3)", border:"none", cursor:"pointer" }}>{t.signout}</button>
                </>
              ) : (
                <>
                  <button onClick={()=>setShowAuth(true)} className="nav-link" style={{ padding:"6px 13px", fontSize:12, fontWeight:500, background:"rgba(255,255,255,0.06)", color:COLORS.muted, border:`0.5px solid ${COLORS.border}`, borderRadius:8, cursor:"pointer" }}>{t.nav_signin}</button>
                  <button onClick={()=>document.getElementById("upload-sec")?.scrollIntoView({behavior:"smooth"})} style={{ padding:"7px 15px", fontSize:12.5, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:8, cursor:"pointer", animation:"glow 3s infinite" }}>{t.nav_cta}</button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding:"96px 20px 70px", textAlign:"center" }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:24, padding:"5px 15px", background:"rgba(239,68,68,0.1)", borderRadius:20, border:"0.5px solid rgba(239,68,68,0.22)" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:COLORS.danger, animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11, fontWeight:700, color:"#f87171", letterSpacing:"0.09em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_badge}</span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(38px,7.5vw,70px)", color:"white", lineHeight:1.06, marginBottom:22, fontWeight:600 }}>
              {t.hero_h1a}<br/>
              <em style={{ color:COLORS.danger, fontStyle:"italic" }}>{t.hero_h1b}</em>
            </h1>
            <p style={{ fontSize:"clamp(15px,2vw,17.5px)", color:COLORS.muted, lineHeight:1.74, maxWidth:530, margin:"0 auto 44px", fontFamily:"'DM Sans',sans-serif" }}>{t.hero_sub}</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, maxWidth:560, margin:"0 auto" }}>
              {[[t.stat1v,t.stat1l],[t.stat2v,t.stat2l],[t.stat3v,t.stat3l]].map(([v,l],i)=>(
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:13, padding:"15px 10px" }}>
                  <div style={{ fontSize:"clamp(20px,3.5vw,30px)", fontWeight:600, color:COLORS.danger, fontFamily:"'Fraunces',serif", marginBottom:5 }}>{v}</div>
                  <div style={{ fontSize:"clamp(9px,1.1vw,11px)", color:COLORS.muted, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEAR SECTION */}
        <section style={{ padding:"0 20px 72px" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:12 }}>
            {[[t.fear1t,t.fear1b,"⚠️"],[t.fear2t,t.fear2b,"🔗"],[t.fear3t,t.fear3b,"🔄"]].map(([title,body,icon],i)=>(
              <div key={i} className="fear-card" style={{ background:"rgba(239,68,68,0.04)", border:"0.5px solid rgba(239,68,68,0.13)", borderRadius:14, padding:"22px 20px" }}>
                <div style={{ fontSize:24, marginBottom:12 }}>{icon}</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17.5, color:"white", marginBottom:10, lineHeight:1.2, fontWeight:600 }}>{title}</h3>
                <p style={{ fontSize:13, color:COLORS.muted, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* UPLOAD + CONTACT COLLECTION */}
        <section id="upload-sec" style={{ padding:"0 20px 60px" }}>
          <div style={{ maxWidth:660, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"26px 24px", backdropFilter:"blur(12px)" }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"white", marginBottom:18, fontWeight:600 }}>{t.upload_title}</h2>

              {/* Output language */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <span style={{ fontSize:12.5, color:COLORS.muted, whiteSpace:"nowrap" }}>{t.out_lang}</span>
                <select value={outLang} onChange={e=>setOutLang(e.target.value)} style={{ flex:1, background:"rgba(255,255,255,0.06)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"9px 13px", color:"white", fontSize:13, cursor:"pointer", outline:"none" }}>
                  {OUT_LANGS.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              {/* ── MOBILE-FRIENDLY FILE PICKER ── */}
              {/* Hidden real input — always present so it can be triggered programmatically */}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx"
                onChange={e=>handleFile(e.target.files[0])}
                style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}
              />

              {file ? (
                /* File chosen — show file card */
                <div style={{ background:"rgba(34,197,94,0.06)", border:"0.5px solid rgba(34,197,94,0.3)", borderRadius:13, padding:"18px 16px", display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                  <div style={{ fontSize:32, flexShrink:0 }}>📄</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#4ade80", margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                    <p style={{ fontSize:11, color:COLORS.muted, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{(file.size/1024).toFixed(0)} KB · {file.name.split(".").pop().toUpperCase()}</p>
                  </div>
                  <button
                    onClick={()=>{ setFile(null); setResult(null); setAutoSentTo(null); }}
                    style={{ background:"rgba(239,68,68,0.12)", border:"0.5px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}
                  >✕</button>
                </div>
              ) : (
                /* Drop / tap zone — whole area is clickable, large touch target */
                <div
                  onDragOver={e=>{e.preventDefault();setDragging(true);}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={onDrop}
                  onClick={()=>fileRef.current.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e=>e.key==="Enter"&&fileRef.current.click()}
                  aria-label={t.upload_drop}
                  style={{
                    border:`1.5px dashed ${dragging?"rgba(139,92,246,0.7)":COLORS.faint}`,
                    borderRadius:13, padding:"36px 20px", textAlign:"center",
                    cursor:"pointer", background:dragging?"rgba(139,92,246,0.05)":"rgba(255,255,255,0.015)",
                    transition:"all .2s", marginBottom:18, WebkitTapHighlightColor:"transparent",
                    touchAction:"manipulation", userSelect:"none",
                  }}
                >
                  {/* Big tap target visual */}
                  <div style={{ width:56, height:56, borderRadius:14, background:"rgba(139,92,246,0.12)", border:"0.5px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 }}>📂</div>
                  <p style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.75)", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{t.upload_drop}</p>
                  <p style={{ fontSize:12, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>{t.upload_formats}</p>
                  {/* Explicit button inside for extra clarity on mobile */}
                  <span style={{ display:"inline-block", padding:"9px 22px", fontSize:13, fontWeight:600, background:COLORS.accentGrad, color:"white", borderRadius:9, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 12px rgba(99,102,241,0.35)", pointerEvents:"none" }}>
                    Choose file
                  </span>
                </div>
              )}

              {/* ── CONTACT COLLECTION ── */}
              <div style={{ background:"rgba(99,102,241,0.06)", border:"0.5px solid rgba(99,102,241,0.18)", borderRadius:13, padding:"18px 16px", marginBottom:18 }}>
                <p style={{ fontSize:14, fontWeight:600, color:"white", margin:"0 0 4px", fontFamily:"'Fraunces',serif" }}>{t.contact_title}</p>
                <p style={{ fontSize:12, color:COLORS.muted, margin:"0 0 14px", fontFamily:"'DM Sans',sans-serif" }}>{t.contact_sub}</p>

                {/* Email — required */}
                <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.6)", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>
                  {t.contact_email_label} <span style={{ color:"#f87171" }}>*</span>
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t.contact_email_ph}
                  value={contactEmail}
                  onChange={e=>{ setContactEmail(e.target.value); setContactError(null); }}
                  style={{ display:"block", width:"100%", background:"rgba(255,255,255,0.06)", border:`0.5px solid ${contactError?"rgba(239,68,68,0.5)":COLORS.border}`, borderRadius:9, padding:"12px 13px", color:"white", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom: contactError ? 4 : 14, boxSizing:"border-box" }}
                />
                {contactError && <p style={{ fontSize:11, color:"#f87171", margin:"0 0 12px", fontFamily:"'DM Sans',sans-serif" }}>{contactError}</p>}

                {/* WhatsApp — optional */}
                <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.6)", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>
                  {t.contact_wa_label}
                  <span style={{ marginLeft:6, fontSize:11, color:COLORS.faint, fontWeight:400 }}>{t.contact_wa_opt}</span>
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>💬</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t.contact_wa_ph}
                    value={contactWa}
                    onChange={e=>setContactWa(e.target.value)}
                    style={{ display:"block", width:"100%", background:"rgba(255,255,255,0.06)", border:`0.5px solid ${COLORS.border}`, borderRadius:9, padding:"12px 13px 12px 36px", color:"white", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
                  />
                </div>

                <p style={{ fontSize:11, color:"rgba(255,255,255,0.22)", margin:"10px 0 0", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                  <span>🔒</span> {t.contact_privacy}
                </p>

                {/* Auto-sent confirmation */}
                {autoSentTo && (
                  <div style={{ marginTop:12, padding:"9px 13px", background:"rgba(34,197,94,0.1)", border:"0.5px solid rgba(34,197,94,0.3)", borderRadius:9, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>✓</span>
                    <p style={{ fontSize:12, color:"#4ade80", margin:0, fontFamily:"'DM Sans',sans-serif" }}>{t.auto_sent} {autoSentTo}</p>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginBottom:12, padding:"9px 13px", background:"rgba(239,68,68,0.09)", borderRadius:9, border:"0.5px solid rgba(239,68,68,0.2)" }}>
                  <p style={{ fontSize:12, color:"#f87171", fontFamily:"'DM Sans',sans-serif", margin:0 }}>{error}</p>
                </div>
              )}

              {!account && (
                <p style={{ fontSize:12, color:COLORS.faint, textAlign:"center", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>
                  {t.account_signin_prompt}{" "}
                  <button onClick={()=>setShowAuth(true)} style={{ background:"none", border:"none", color:"rgba(167,139,250,0.7)", cursor:"pointer", fontSize:12, textDecoration:"underline", fontFamily:"'DM Sans',sans-serif" }}>{t.nav_signin}</button>
                </p>
              )}

              <button
                onClick={analyse}
                disabled={!file||loading}
                style={{ width:"100%", padding:"15px", fontSize:15, fontWeight:700, borderRadius:12, border:"none", cursor:file&&!loading?"pointer":"not-allowed", background:file&&!loading?COLORS.accentGrad:"rgba(255,255,255,0.05)", color:file&&!loading?"white":"rgba(255,255,255,0.18)", transition:"all .2s", letterSpacing:"0.02em", touchAction:"manipulation", WebkitTapHighlightColor:"transparent" }}
              >
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/>
                    {loadMsg}
                  </span>
                ) : t.analyse_btn}
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS */}
        {result && (
          <section ref={resultsRef} style={{ padding:"0 20px 80px", animation:"fadeUp .5s ease" }}>
            <div style={{ maxWidth:660, margin:"0 auto" }}>

              {/* Score card */}
              <div style={{ background:"rgba(255,255,255,0.024)", border:`0.5px solid ${COLORS.border}`, borderRadius:20, padding:"22px 22px", marginBottom:12, display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
                <ScoreRing score={result.score} label={result.score_label} t={t}/>
                <div style={{ flex:1, minWidth:190 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.9)", background:"rgba(167,139,250,0.1)", padding:"2px 10px", borderRadius:20, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{result.contract_type}</span>
                    {result.parties?.slice(0,2).map((p,i)=>(
                      <span key={i} style={{ fontSize:11, color:COLORS.muted, background:"rgba(255,255,255,0.05)", padding:"2px 10px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>{p}</span>
                    ))}
                  </div>
                  <p style={{ fontSize:13, lineHeight:1.72, color:COLORS.muted, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{result.summary}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontStyle:"italic", fontFamily:"'DM Sans',sans-serif" }}>{result.score_reasoning}</p>
                </div>
              </div>

              {/* Recommendation */}
              <div style={{ background:"rgba(99,102,241,0.07)", border:"0.5px solid rgba(99,102,241,0.2)", borderRadius:13, padding:"15px 17px", marginBottom:12, display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#818cf8", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{t.rec_title}</p>
                  <p style={{ fontSize:13, lineHeight:1.72, color:"rgba(200,195,255,0.85)", fontFamily:"'DM Sans',sans-serif" }}>{result.overall_recommendation}</p>
                </div>
              </div>

              {/* Delivery */}
              <DeliveryPanel result={result} t={t} uiLang={uiLang} pdfUri={pdfUri}/>

              {/* Tabs */}
              <div style={{ display:"flex", gap:3, marginBottom:12, background:"rgba(255,255,255,0.024)", borderRadius:11, padding:"3px", border:`0.5px solid rgba(255,255,255,0.06)` }}>
                {tabBtn("clauses", `${t.tab_clauses} (${result.key_clauses?.length||0})`)}
                {tabBtn("flags",   `${t.tab_flags} (${result.red_flags?.length||0})`)}
                {tabBtn("missing", `${t.tab_missing} (${result.missing_protections?.length||0})`)}
              </div>

              {/* Tab content */}
              <div style={{ background:"rgba(255,255,255,0.018)", border:`0.5px solid rgba(255,255,255,0.06)`, borderRadius:14, padding:16, position:"relative", overflow:"hidden" }}>
                {!unlocked && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:13 }}>
                    <span style={{ background:"rgba(239,68,68,0.13)", color:"#f87171", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, letterSpacing:"0.05em", fontFamily:"'DM Sans',sans-serif" }}>{t.preview_only}</span>
                    <span style={{ fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>
                      {t.showing} {
                        tab==="clauses"?Math.min(CLAUSE_PREVIEW,result.key_clauses?.length||0):
                        tab==="flags"?Math.min(FLAG_PREVIEW,result.red_flags?.length||0):
                        Math.min(MISSING_PREVIEW,result.missing_protections?.length||0)
                      } {t.of} {
                        tab==="clauses"?result.key_clauses?.length:
                        tab==="flags"?result.red_flags?.length:
                        result.missing_protections?.length
                      }
                    </span>
                  </div>
                )}
                {tab==="clauses" && renderPaywalled(result.key_clauses, CLAUSE_PREVIEW,  (c,i) => <ClauseCard key={i} clause={c} t={t}/>)}
                {tab==="flags"   && renderPaywalled(result.red_flags,   FLAG_PREVIEW,    (f,i) => <FlagCard   key={i} flag={f}   t={t}/>)}
                {tab==="missing" && renderPaywalled(result.missing_protections, MISSING_PREVIEW, (m,i) => (
                  <div key={i} style={{ display:"flex", gap:9, padding:"10px 12px", marginBottom:7, background:"rgba(245,158,11,0.05)", border:"0.5px solid rgba(245,158,11,0.15)", borderRadius:9 }}>
                    <span style={{ color:"#fbbf24", flexShrink:0 }}>⚠</span>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.68)", lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{m}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"center", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{result.disclaimer}</p>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:"white", textAlign:"center", marginBottom:36, fontWeight:600 }}>{t.how_title}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
              {[["⬆",t.how1t,t.how1b,"01"],["🔍",t.how2t,t.how2b,"02"],["📋",t.how3t,t.how3b,"03"]].map(([icon,title,body,n],i)=>(
                <div key={i} className="how-card" style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"22px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:"rgba(139,92,246,0.55)", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>{n}</span>
                  </div>
                  <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17, color:"white", marginBottom:8, lineHeight:1.2, fontWeight:600 }}>{title}</h3>
                  <p style={{ fontSize:12.5, color:COLORS.muted, lineHeight:1.68, fontFamily:"'DM Sans',sans-serif" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding:"72px 20px" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:"white", textAlign:"center", marginBottom:36, fontWeight:600 }}>{t.test_title}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
              {[[t.t1n,t.t1r,t.t1t],[t.t2n,t.t2r,t.t2t],[t.t3n,t.t3r,t.t3t]].map(([name,role,text],i)=>(
                <div key={i} style={{ background:COLORS.surface, border:`0.5px solid ${COLORS.border}`, borderRadius:14, padding:"20px 18px" }}>
                  <div style={{ marginBottom:11, color:"#f59e0b", fontSize:13, letterSpacing:"2px" }}>★★★★★</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.62)", lineHeight:1.72, marginBottom:14, fontStyle:"italic", fontFamily:"'DM Sans',sans-serif" }}>"{text}"</p>
                  <p style={{ fontSize:13, fontWeight:600, color:COLORS.text, fontFamily:"'DM Sans',sans-serif" }}>{name}</p>
                  <p style={{ fontSize:11, color:COLORS.muted, fontFamily:"'DM Sans',sans-serif" }}>{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding:"72px 20px", background:"rgba(255,255,255,0.013)" }}>
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,38px)", color:"white", textAlign:"center", marginBottom:36, fontWeight:600 }}>{t.faq_title}</h2>
            <FaqItem q={t.faq1q} a={t.faq1a}/>
            <FaqItem q={t.faq2q} a={t.faq2a}/>
            <FaqItem q={t.faq3q} a={t.faq3a}/>
            <FaqItem q={t.faq4q} a={t.faq4a}/>
            <FaqItem q={t.faq5q} a={t.faq5a}/>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:"80px 20px", textAlign:"center", background:"rgba(99,102,241,0.05)", borderTop:"0.5px solid rgba(99,102,241,0.14)" }}>
          <div style={{ maxWidth:520, margin:"0 auto" }}>
            <ContrivoxLogo size={20}/>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,4vw,40px)", color:"white", margin:"20px 0 10px", lineHeight:1.15, fontWeight:600 }}>{t.cta_band}</h2>
            <p style={{ fontSize:14, color:COLORS.muted, marginBottom:28, fontFamily:"'DM Sans',sans-serif" }}>{t.app_tagline}</p>
            <button onClick={()=>document.getElementById("upload-sec")?.scrollIntoView({behavior:"smooth"})} style={{ padding:"14px 32px", fontSize:15, fontWeight:700, background:COLORS.accentGrad, color:"white", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 5px 30px rgba(99,102,241,0.38)", animation:"glow 3s infinite" }}>{t.nav_cta}</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding:"26px 20px", textAlign:"center", borderTop:`0.5px solid ${COLORS.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap", marginBottom:10 }}>
            <ContrivoxLogo size={14}/>
            <span style={{ color:COLORS.faint, fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>·</span>
            <span style={{ fontSize:11, color:COLORS.faint, fontFamily:"'DM Sans',sans-serif" }}>{t.footer_copy}</span>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", maxWidth:600, margin:"0 auto", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{t.disclaimer}</p>
        </footer>
      </div>
    </>
  );
}
