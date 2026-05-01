// Shared TypeScript Types — ElectiGuide AI

export interface PartyHistoryEntry {
  party: string;
  from: number;
  to: number | null; // null = current
}

export interface CandidateDossier {
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
  declarations: string[];
}

export interface CandidateComparison {
  candidateA: CandidateDossier;
  candidateB: CandidateDossier;
  wealthDiff: number;
  wealthRatio: string;
  educationDiff: string;
  criminalDiff: number;
  assetToLiabilityA: number;
  assetToLiabilityB: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  safetyAlerts?: string[];
}

export interface SafetyNewsTicker {
  id: string;
  headline: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}
