/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Co-Pilot Engine
   Contextual greetings, knowledge-based responses, streaming
   ════════════════════════════════════════════════════════════ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/* ──── Contextual Greetings ──── */

export function getGreeting(pathname: string): string {
  if (pathname.includes("/registration")) return "Need help with Form 6 or voter registration? I'm your guide.";
  if (pathname.includes("/dossier")) return "Researching candidates? I can explain criminal records, asset declarations, or party histories.";
  if (pathname.includes("/polling")) return "Is there a problem at your booth? I'm here to help.";
  if (pathname.includes("/results")) return "Wondering what happens after voting? Ask me about the counting process.";
  return "Welcome to ElectiGuide AI. How can I assist your voter journey today?";
}

/* ──── Knowledge Base (from election-laws.md) ──── */

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  action?: { type: "navigate" | "trigger"; target: string; label: string };
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ["49p", "impersonation", "already voted", "someone voted", "personation", "challenged"],
    answer: "Under Section 49P of the Conduct of Elections Rules, if someone has voted using your identity, you must:\n\n1. Immediately inform the Presiding Officer\n2. Demand a 'Challenged Vote' on a tendered ballot\n3. Fill Form 49AA confirming your identity\n4. File an FIR under IPC Section 171D\n5. Call the ECI Helpline 1950 to escalate\n\nDo NOT leave the booth — your right to vote is protected by law.",
    action: { type: "navigate", target: "/polling", label: "Go to Polling HQ for SOS" },
  },
  {
    keywords: ["name missing", "not in list", "electoral roll", "name not found", "49(2)"],
    answer: "If your name is missing from the voter list (Section 49(2) of the R.P. Act):\n\n1. Show your EPIC card to the Presiding Officer\n2. Request a Tendered Vote under Section 49(2)\n3. Fill Form 49AA with your details\n4. Your vote is recorded on a tendered ballot paper (not EVM)\n5. File a complaint at the DEO office within 7 days\n6. Call ECI Helpline 1950 for immediate help",
    action: { type: "navigate", target: "/polling", label: "Open SOS Cards" },
  },
  {
    keywords: ["nota", "none of the above", "reject", "49-o"],
    answer: "NOTA (None of the Above) — Rule 49-O:\n\n• It's the last button on the EVM\n• You can reject ALL candidates if none meet your standards\n• NOTA votes are counted and reported officially\n• Currently, even if NOTA gets the most votes, the leading candidate still wins\n• Your NOTA vote is completely secret — no one can identify how you voted\n\nIt's your constitutional right, affirmed by the Supreme Court in 2013.",
  },
  {
    keywords: ["form 6", "new registration", "register", "first time", "18", "new voter"],
    answer: "Form 6 — New Voter Registration:\n\n• You must be 18+ on the qualifying date (January 1st)\n• Documents needed: Proof of Age (Birth Certificate / Class 10 Marksheet) + Proof of Address (Aadhaar / Passport)\n• Apply online at voters.eci.gov.in or at your local ERO office\n• Apply at least 30 days before election for guaranteed inclusion\n• After applying, a BLO will visit your home for verification",
    action: { type: "navigate", target: "/registration", label: "Start Registration Checklist" },
  },
  {
    keywords: ["form 8a", "transfer", "moved", "relocated", "new address", "constituency change"],
    answer: "Form 8A — Address Transfer:\n\n• For voters who've moved to a different constituency\n• File online at voters.eci.gov.in or at your new constituency's ERO office\n• You'll need new address proof (Aadhaar, Utility Bill, Rent Agreement)\n• Your old registration is automatically deleted once the transfer is approved",
    action: { type: "navigate", target: "/registration", label: "Go to Registration" },
  },
  {
    keywords: ["blo", "booth level", "verification", "officer"],
    answer: "Booth Level Officer (BLO):\n\n• Your BLO is assigned to verify voter applications in your area\n• They visit your home after you submit Form 6\n• Find your BLO at voters.eci.gov.in or call 1950\n• BLO verifies your identity, age, and address in person",
  },
  {
    keywords: ["id", "identity", "document", "epic", "voter id", "photo id", "aadhaar"],
    answer: "Accepted Photo IDs at Polling Booth:\n\n• EPIC (Voter ID Card) — primary\n• Aadhaar Card\n• Passport\n• Driving License\n• PAN Card\n• MNREGA Job Card\n• Bank Passbook with Photo\n• And 5 other govt-issued photo IDs\n\nYou need ANY ONE of these 12 approved IDs to vote.",
  },
  {
    keywords: ["helpline", "emergency", "complaint", "cvigil", "1950"],
    answer: "ECI Emergency Helpline: 1950\n\n• Available 24×7 on polling day\n• For voter assistance, complaints, and impersonation reports\n• Also use the cVIGIL app to report violations with photo/video evidence\n• For police emergencies: 100 or 112",
    action: { type: "navigate", target: "/polling", label: "View Emergency Contacts" },
  },
  {
    keywords: ["counting", "result", "when", "evm", "strongroom", "declaration"],
    answer: "Post-Voting Process:\n\n1. EVM Sealing & Transport — EVMs are sealed and moved to strongroom under CCTV\n2. Strongroom Security — 24/7 CAPF guard, triple-lock protocol\n3. Counting Day — Round-by-round counting, results streamed live\n4. Official Declaration — Returning Officer declares winner, Certificate of Election issued\n\nCounting usually happens 3-7 days after polling.",
    action: { type: "navigate", target: "/results", label: "View Counting Roadmap" },
  },
  {
    keywords: ["leave", "employer", "work", "office", "paid leave", "135b"],
    answer: "Your Right to Paid Leave (Section 135B):\n\n• Your employer MUST grant paid leave on polling day\n• This applies to all employees — private and public sector\n• Violation by employer is a punishable offense\n• You don't need to 'apply' — it's a statutory right",
  },
];

/* ──── Response Generator ──── */

export function generateResponse(userMessage: string): { content: string; action?: KnowledgeEntry["action"] } {
  const lower = userMessage.toLowerCase();

  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { content: entry.answer, action: entry.action };
    }
  }

  // Fallback
  return {
    content: "I can help with:\n\n• Voter Registration (Form 6 / Form 8A)\n• Polling Day Issues (Section 49P, Name Missing)\n• NOTA Guide\n• Candidate Research\n• Counting Process\n• Emergency Helpline (1950)\n\nTry asking about any of these topics!",
  };
}

/* ──── Streaming Simulator ──── */

export function streamResponse(
  text: string,
  onChunk: (partial: string) => void,
  onComplete: () => void
): () => void {
  let cancelled = false;
  let index = 0;
  const words = text.split(" ");

  function next() {
    if (cancelled || index >= words.length) {
      if (!cancelled) onComplete();
      return;
    }
    const chunk = words.slice(0, index + 1).join(" ");
    onChunk(chunk);
    index++;
    setTimeout(next, 25 + Math.random() * 35);
  }

  setTimeout(next, 400); // initial "thinking" delay
  return () => { cancelled = true; };
}
