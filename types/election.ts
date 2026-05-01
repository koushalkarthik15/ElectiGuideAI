/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Shared TypeScript Types
   ════════════════════════════════════════════════════════════ */

/* ──── Candidate Dossier ──── */

export interface PartyHistoryEntry {
  party: string;
  from: number;
  to: number | null; // null = current
}

export interface Candidate {
  id: string;
  name: string;
  age: number;
  party: string;
  partyAbbr: string;
  partyColor: string;
  photoUrl: string;
  constituency: string;
  education: string;
  totalAssets: number;       // in INR
  liabilities: number;       // in INR
  criminalCases: number;
  seriousCriminalCases: number;
  partyHistory: PartyHistoryEntry[];
  declarations: string[];    // notable affidavit declarations
}

export interface CandidateComparison {
  candidateA: Candidate;
  candidateB: Candidate;
  wealthDiff: number;        // A.totalAssets - B.totalAssets
  wealthRatio: string;       // e.g. "2.5x"
  educationDiff: string;     // descriptive comparison
  criminalDiff: number;      // A.criminalCases - B.criminalCases
  assetToLiabilityA: number; // ratio
  assetToLiabilityB: number; // ratio
}

/* ──── Voter Profile ──── */

export interface VoterProfile {
  id: string;
  epicNumber: string;
  status: 'unregistered' | 'pending' | 'registered';
  pollingStationId?: string;
}

/* ──── Weather ──── */

export interface WeatherCondition {
  temp: number;
  description: string;
  isSafeToTravel: boolean;
}

/* ──── Safety Ticker ──── */

export interface SafetyNewsTicker {
  id: string;
  headline: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}
