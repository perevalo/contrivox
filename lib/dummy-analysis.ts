import type { ContrivoxAnalysis } from "./validation";

const DUMMY_EN: ContrivoxAnalysis = {
  contract_type: "Employment Agreement",
  summary:
    "This employment agreement contains several clauses that favor the employer over the employee. Two key provisions require careful review before signing: the non-compete clause and the mandatory arbitration clause. The overall fairness score of 62 reflects a moderately unbalanced agreement.",
  parties: ["Employer", "Employee"],
  governing_state: null,
  key_clauses: [
    {
      title: "At-Will Employment",
      plain_english:
        "Either party can end the employment relationship at any time, for any reason, without notice. While standard in the US, this means you could be let go without warning or severance.",
      risk_level: "medium",
      risk_note: "No severance is guaranteed. Ask for a minimum notice period of 2–4 weeks.",
      us_legal_context:
        "At-will employment is the default in 49 US states — only Montana requires cause for termination.",
    },
    {
      title: "Intellectual Property Assignment",
      plain_english:
        "Everything you create during your employment — including personal projects done on your own time — may belong to the company. This is one of the broadest IP clauses we see.",
      risk_level: "high",
      risk_note:
        "Could claim ownership of side projects. Negotiate a written carve-out for work done outside working hours and unrelated to the business.",
      us_legal_context:
        "California, Delaware, and several other states limit employer IP claims on work done outside employment on personal time.",
    },
    {
      title: "Non-Compete Clause",
      plain_english:
        "You agree not to work for a competitor for 2 years after leaving. The geographic scope covers the entire United States, which is unusually broad.",
      risk_level: "high",
      risk_note:
        "Overly broad in scope and duration. Courts in many states are refusing to enforce sweeping non-competes.",
      us_legal_context:
        "Non-compete enforceability varies dramatically by state. California, Minnesota, and North Dakota ban them almost entirely.",
    },
    {
      title: "Mandatory Arbitration",
      plain_english:
        "You give up your right to sue the company in court. All disputes go to private arbitration — a process typically selected and funded by the employer.",
      risk_level: "high",
      risk_note: "Waives your right to a jury trial and class action lawsuits.",
      us_legal_context:
        "The Federal Arbitration Act generally enforces arbitration clauses, though the Ending Forced Arbitration Act limits them for sexual harassment claims.",
    },
    {
      title: "Confidentiality Clause",
      plain_english:
        "You cannot share company information during or after employment. The definition of 'confidential' is extremely broad and has no end date.",
      risk_level: "medium",
      risk_note: "Duration is indefinite. Standard NDAs typically expire after 2–5 years.",
      us_legal_context: null,
    },
  ],
  red_flags: [
    {
      issue: "Signing Bonus Clawback with No Fault Trigger",
      why_it_matters:
        "If you leave within 24 months for any reason — including layoff — you must repay the full signing bonus. This creates a financial trap even if the company fires you without cause.",
      challenge:
        "Negotiate: 'I'd like to limit the clawback to voluntary resignation only, and prorate it monthly over 12 months rather than 24.'",
      challengeable: true,
      urgency: "high",
    },
    {
      issue: "Unilateral Contract Modification",
      why_it_matters:
        "The company can change any term of your employment — including compensation structure — with just 2 weeks written notice. Your continued employment is deemed acceptance.",
      challenge:
        "Request: 'Add mutual consent language: any material changes to compensation or title require written agreement from both parties before taking effect.'",
      challengeable: true,
      urgency: "high",
    },
    {
      issue: "Overly Broad Non-Solicitation of Clients",
      why_it_matters:
        "You cannot contact or work with any client you interacted with — even casually — for 2 years after leaving, regardless of whether you originally brought that client to the company.",
      challenge:
        "Narrow the scope: 'Limit to clients I directly managed with active revenue in the 12 months prior to my departure, not all contacts I ever interacted with.'",
      challengeable: true,
      urgency: "medium",
    },
  ],
  missing_protections: [
    "Severance clause — no guaranteed pay if laid off or terminated without cause",
    "Good reason resignation — no right to leave with severance if your role is materially changed",
    "Neutral arbitrator selection — company controls the arbitration process",
    "Garden leave provision — no pay during the non-compete restriction period",
    "Termination notice period — company can terminate same-day with no notice",
  ],
  score: 62,
  score_label: "Concerning",
  score_reasoning:
    "This contract scores 62 due to the combination of a broad IP assignment, a sweeping non-compete, and mandatory arbitration without neutral arbitrator selection. While some clauses are standard, the clawback provision and unilateral modification clause are notably one-sided.",
  overall_recommendation:
    "Do not sign as written. The non-compete, IP assignment, and clawback clause all require negotiation before you are adequately protected. Most employers will agree to reasonable modifications if you ask in writing before your start date.",
  disclaimer:
    "Contrivox is not a law firm and does not provide legal advice. This report is for informational purposes only. Consult a qualified attorney before signing any employment agreement.",
};

const DUMMY_PT: ContrivoxAnalysis = {
  ...DUMMY_EN,
  contract_type: "Contrato de Emprego",
  summary:
    "Este contrato de emprego contém diversas cláusulas que favorecem o empregador. Duas provisões principais exigem revisão cuidadosa antes de assinar: a cláusula de não competição e a arbitragem obrigatória. A pontuação de equidade de 62 reflete um acordo moderadamente desequilibrado.",
  overall_recommendation:
    "Não assine como está. A cláusula de não competição, a atribuição de propriedade intelectual e a cláusula de recuperação do bônus exigem negociação antes de você estar adequadamente protegido.",
  disclaimer:
    "A Contrivox não é um escritório de advocacia e não fornece aconselhamento jurídico. Este relatório é apenas para fins informativos. Consulte um advogado qualificado antes de assinar qualquer contrato de emprego.",
};

const DUMMY_ES: ContrivoxAnalysis = {
  ...DUMMY_EN,
  contract_type: "Contrato de Empleo",
  summary:
    "Este contrato de empleo contiene varias cláusulas que favorecen al empleador. Dos disposiciones clave requieren revisión cuidadosa antes de firmar: la cláusula de no competencia y el arbitraje obligatorio. La puntuación de equidad de 62 refleja un acuerdo moderadamente desequilibrado.",
  overall_recommendation:
    "No firme tal como está. La cláusula de no competencia, la asignación de propiedad intelectual y la cláusula de recuperación de bonificación requieren negociación antes de que esté adecuadamente protegido.",
  disclaimer:
    "Contrivox no es un bufete de abogados y no proporciona asesoramiento legal. Este informe es solo para fines informativos. Consulte a un abogado calificado antes de firmar cualquier contrato de empleo.",
};

const DUMMIES: Record<string, ContrivoxAnalysis> = {
  en: DUMMY_EN,
  pt: DUMMY_PT,
  es: DUMMY_ES,
};

export function buildDummyAnalysis(langCode: string): ContrivoxAnalysis {
  return DUMMIES[langCode] ?? DUMMY_EN;
}
