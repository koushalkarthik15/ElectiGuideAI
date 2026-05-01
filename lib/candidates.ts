/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Candidate Dossier Data & Comparison Logic
   Hyderabad Constituency — 5 Detailed Candidates
   ════════════════════════════════════════════════════════════ */

import type { Candidate, CandidateComparison } from "@/types/election";
import { formatINRIntl } from "@/lib/format-utils";

/* ──── Constituency: Hyderabad (Telangana) ──── */

export const CONSTITUENCY = {
  name: "Hyderabad",
  state: "Telangana",
  type: "General" as const,
  electors: 15_34_287,
};

/* ──── Candidate Dossier Data ──── */

export const CANDIDATES: Candidate[] = [
  {
    id: "cand-001",
    name: "Rajendra Vikram Singh",
    age: 58,
    party: "Bharatiya Janata Party",
    partyAbbr: "BJP",
    partyColor: "#FF6B00",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "M.Tech from IIT Bombay, M.B.A. (Finance)",
    totalAssets: 45_00_00_000,      // ₹45 Cr
    liabilities: 2_00_00_000,       // ₹2 Cr
    criminalCases: 2,
    seriousCriminalCases: 0,
    partyHistory: [
      { party: "Indian National Congress", from: 1998, to: 2009 },
      { party: "Bharatiya Janata Party", from: 2009, to: null },
    ],
    declarations: [
      "Net Worth: ₹45 Cr Assets vs ₹2 Cr Liabilities",
      "Owns 3 commercial properties in Banjara Hills, Hyderabad",
      "Spouse holds directorship in 2 private IT firms",
      "No pending tax liabilities declared",
      "Former member of Hyderabad Metropolitan Development Authority",
    ],
  },
  {
    id: "cand-002",
    name: "Priya Mehra Joshi",
    age: 44,
    party: "Indian National Congress",
    partyAbbr: "INC",
    partyColor: "#19AAAD",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "Ph.D. (Economics) from University of Hyderabad, M.B.A. (IIM Ahmedabad)",
    totalAssets: 28_50_00_000,       // ₹28.5 Cr
    liabilities: 4_75_00_000,        // ₹4.75 Cr
    criminalCases: 0,
    seriousCriminalCases: 0,
    partyHistory: [
      { party: "Indian National Congress", from: 2008, to: null },
    ],
    declarations: [
      "Net Worth: ₹28.5 Cr Assets vs ₹4.75 Cr Liabilities",
      "Former university professor for 12 years at Osmania University",
      "Authored 5 policy papers on urban economics and IT sector growth",
      "No immovable property outside Hyderabad district",
      "Trustee of 'Telangana Vidya Foundation' — 3,200 scholarships awarded",
    ],
  },
  {
    id: "cand-003",
    name: "Kamal Nath Yadav",
    age: 51,
    party: "Bharat Rashtra Samithi",
    partyAbbr: "BRS",
    partyColor: "#E81B23",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "B.A. (Political Science), Diploma in Public Administration",
    totalAssets: 67_30_00_000,       // ₹67.3 Cr
    liabilities: 12_40_00_000,       // ₹12.4 Cr
    criminalCases: 4,
    seriousCriminalCases: 2,
    partyHistory: [
      { party: "Telugu Desam Party", from: 2002, to: 2010 },
      { party: "Telangana Rashtra Samithi", from: 2010, to: 2022 },
      { party: "Bharat Rashtra Samithi", from: 2022, to: null },
    ],
    declarations: [
      "Net Worth: ₹67.3 Cr Assets vs ₹12.4 Cr Liabilities",
      "2 serious cases under IPC Section 307 (pending trial since 2018)",
      "Owns pharmaceutical distribution company with 450 employees",
      "Family members hold 3 local municipal corporator positions",
      "4 pending criminal cases across Hyderabad and Ranga Reddy courts",
    ],
  },
  {
    id: "cand-004",
    name: "Dr. Ananya Srivastava",
    age: 39,
    party: "Independent",
    partyAbbr: "IND",
    partyColor: "#6B7280",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "MBBS (Osmania Medical College), M.D. (Public Health), MPH (Johns Hopkins)",
    totalAssets: 8_20_00_000,        // ₹8.2 Cr
    liabilities: 1_10_00_000,        // ₹1.1 Cr
    criminalCases: 0,
    seriousCriminalCases: 0,
    partyHistory: [],
    declarations: [
      "Net Worth: ₹8.2 Cr Assets vs ₹1.1 Cr Liabilities",
      "First-time contestant, no political background",
      "Led COVID-19 relief operations across 3 Telangana districts",
      "Published researcher with 28 peer-reviewed papers on public health",
      "Founded 'HealthBridge Telangana' — free clinics in 12 mandals",
    ],
  },
  {
    id: "cand-005",
    name: "Mohammed Asif Khan",
    age: 62,
    party: "All India Majlis-e-Ittehadul Muslimeen",
    partyAbbr: "AIMIM",
    partyColor: "#2E8B57",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "LL.B. (Osmania University), M.A. (History), Diploma in International Law (The Hague)",
    totalAssets: 52_80_00_000,       // ₹52.8 Cr
    liabilities: 8_30_00_000,        // ₹8.3 Cr
    criminalCases: 1,
    seriousCriminalCases: 0,
    partyHistory: [
      { party: "All India Majlis-e-Ittehadul Muslimeen", from: 1994, to: null },
    ],
    declarations: [
      "Net Worth: ₹52.8 Cr Assets vs ₹8.3 Cr Liabilities",
      "3-time incumbent MLA from Charminar constituency",
      "Owns chain of educational institutions — 8 schools across Old City",
      "1 pending defamation case (non-serious, under IPC Section 500)",
      "Board member of Hyderabad Urban Development Authority since 2018",
    ],
  },
  {
    id: "cand-006",
    name: "Tapan Maity",
    age: 47,
    party: "Independent",
    partyAbbr: "IND",
    partyColor: "#8B6914",
    photoUrl: "",
    constituency: "Hyderabad",
    education: "8th Pass",
    totalAssets: 7_80_000,            // ₹7.8 Lakh
    liabilities: 0,                    // ₹0
    criminalCases: 0,
    seriousCriminalCases: 0,
    partyHistory: [],
    declarations: [
      "Net Worth: ₹7.8 Lakh Assets vs ₹0 Liabilities",
      "Self-employed — operates a small retail business in Charminar area",
      "First-time contestant, no political affiliations",
      "Zero criminal cases — clean record verified by ADR",
      "Declared movable assets include one two-wheeler and shop inventory",
    ],
  },
];

/* ──── Currency Formatting (Legacy — now using format-utils.ts) ──── */

export function formatINR(amount: number): string {
  return formatINRIntl(amount);
}

/* ──── Comparison Logic ──── */

export function compareCandidates(
  idA: string,
  idB: string
): CandidateComparison | null {
  const a = CANDIDATES.find((c) => c.id === idA);
  const b = CANDIDATES.find((c) => c.id === idB);

  if (!a || !b) return null;

  const wealthDiff = a.totalAssets - b.totalAssets;
  const wealthRatioNum =
    Math.max(a.totalAssets, b.totalAssets) /
    Math.max(Math.min(a.totalAssets, b.totalAssets), 1);

  // Education comparison
  const eduLevels: Record<string, number> = {
    "10th": 1, "12th": 2, "Diploma": 3, "B.A.": 4, "B.Sc.": 4,
    "B.Com.": 4, "B.Tech.": 4, "MBBS": 5, "M.A.": 5, "M.Sc.": 5,
    "M.B.A.": 5, "LL.B.": 5, "M.Tech": 6, "M.D.": 6, "Ph.D.": 6,
    "MPH": 6, "IIT": 7, "IIM": 7,
  };

  function getMaxEduLevel(edu: string): number {
    let max = 0;
    for (const [key, level] of Object.entries(eduLevels)) {
      if (edu.includes(key) && level > max) max = level;
    }
    return max || 3;
  }

  const eduA = getMaxEduLevel(a.education);
  const eduB = getMaxEduLevel(b.education);
  let educationDiff = "Comparable education levels";
  if (eduA > eduB) educationDiff = `${a.name.split(" ")[0]} has higher formal education`;
  if (eduB > eduA) educationDiff = `${b.name.split(" ")[0]} has higher formal education`;

  return {
    candidateA: a,
    candidateB: b,
    wealthDiff,
    wealthRatio: `${wealthRatioNum.toFixed(1)}x`,
    educationDiff,
    criminalDiff: a.criminalCases - b.criminalCases,
    assetToLiabilityA: a.totalAssets / Math.max(a.liabilities, 1),
    assetToLiabilityB: b.totalAssets / Math.max(b.liabilities, 1),
  };
}

/* ──── Asset-to-Liability Ratio Helper ──── */

export function getAssetLiabilityPercent(candidate: Candidate): number {
  const total = candidate.totalAssets + candidate.liabilities;
  if (total === 0) return 50;
  return Math.round((candidate.totalAssets / total) * 100);
}
