import { create } from 'zustand';

/* ──────────────────────────────────────────────────────────────
   ElectiGuide AI — Voter Progress Store (Zustand + localStorage)
   ────────────────────────────────────────────────────────────── */

export type VoterPath = 'newbie' | 'veteran' | null;

export interface VoterStep {
  id: string;
  title: string;
  description: string;
  externalUrl: string;
  externalLabel: string;
}

export const NEWBIE_STEPS: VoterStep[] = [
  {
    id: 'newbie-1',
    title: 'Search Electoral Roll',
    description: 'Verify if your name already exists in the voter list to avoid duplicate applications.',
    externalUrl: 'https://electoralsearch.eci.gov.in/',
    externalLabel: 'Open Electoral Search',
  },
  {
    id: 'newbie-2',
    title: 'Form 6 Guide',
    description: 'Complete Form 6 for new voter registration. Required for first-time applicants aged 18+.',
    externalUrl: 'https://voters.eci.gov.in/signup',
    externalLabel: 'Start Form 6 Online',
  },
  {
    id: 'newbie-3',
    title: 'Document Checklist',
    description: 'Gather Proof of Age (Birth Certificate / Marksheet) and Proof of Address (Aadhaar / Passport).',
    externalUrl: 'https://voters.eci.gov.in/',
    externalLabel: 'View Requirements',
  },
  {
    id: 'newbie-4',
    title: 'BLO Tracker',
    description: 'Locate your Booth Level Officer for door-to-door verification after applying.',
    externalUrl: 'https://voters.eci.gov.in/',
    externalLabel: 'Find Your BLO',
  },
];

export const VETERAN_STEPS: VoterStep[] = [
  {
    id: 'veteran-1',
    title: 'Status Verification',
    description: 'Confirm your active registration status and ensure no discrepancies in records.',
    externalUrl: 'https://electoralsearch.eci.gov.in/',
    externalLabel: 'Verify Status',
  },
  {
    id: 'veteran-2',
    title: 'EPIC ID Audit',
    description: 'Cross-check your EPIC (Voter ID) card details — name spelling, photo, and DOB accuracy.',
    externalUrl: 'https://voters.eci.gov.in/',
    externalLabel: 'Audit EPIC Card',
  },
  {
    id: 'veteran-3',
    title: 'Address Sync Check',
    description: 'If you\'ve relocated, file Form 8A to transfer your registration to the new constituency.',
    externalUrl: 'https://voters.eci.gov.in/',
    externalLabel: 'File Form 8A',
  },
  {
    id: 'veteran-4',
    title: 'Booth Confirmation',
    description: 'Confirm your assigned polling booth and check the route before election day.',
    externalUrl: 'https://voters.eci.gov.in/',
    externalLabel: 'Find Polling Booth',
  },
];

/* ──────────────────── Store Interface ──────────────────── */

interface VoterState {
  voterPath: VoterPath;
  completedSteps: string[];
  epicNumber: string | null;
  hasVoted: boolean;

  setVoterPath: (path: VoterPath) => void;
  toggleStep: (stepId: string) => void;
  isStepComplete: (stepId: string) => boolean;
  resetProgress: () => void;
  setEpicNumber: (epic: string) => void;
  markAsVoted: () => void;
  getProgressPercent: () => number;
  getCurrentSteps: () => VoterStep[];
}

/* ──────────────────── localStorage Helpers ──────────────────── */

const STORAGE_KEY = 'electiguide-voter-progress';

interface PersistedState {
  voterPath: VoterPath;
  completedSteps: string[];
  epicNumber: string | null;
  hasVoted: boolean;
}

function loadPersistedState(): Partial<PersistedState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

function persistState(state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/* ──────────────────── Zustand Store ──────────────────── */

const persisted = loadPersistedState();

export const useVoterStore = create<VoterState>((set, get) => ({
  voterPath: persisted.voterPath ?? null,
  completedSteps: persisted.completedSteps ?? [],
  epicNumber: persisted.epicNumber ?? null,
  hasVoted: persisted.hasVoted ?? false,

  setVoterPath: (path) => {
    set({ voterPath: path, completedSteps: [] });
    persistState({ voterPath: path, completedSteps: [], epicNumber: get().epicNumber, hasVoted: get().hasVoted });
  },

  toggleStep: (stepId) => {
    const { completedSteps, voterPath, epicNumber } = get();
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];
    set({ completedSteps: next });
    persistState({ voterPath, completedSteps: next, epicNumber, hasVoted: get().hasVoted });
  },

  isStepComplete: (stepId) => get().completedSteps.includes(stepId),

  resetProgress: () => {
    set({ voterPath: null, completedSteps: [], epicNumber: null, hasVoted: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  setEpicNumber: (epicNumber) => {
    set({ epicNumber });
    const { voterPath, completedSteps, hasVoted } = get();
    persistState({ voterPath, completedSteps, epicNumber, hasVoted });
  },

  markAsVoted: () => {
    set({ hasVoted: true });
    const { voterPath, completedSteps, epicNumber } = get();
    persistState({ voterPath, completedSteps, epicNumber, hasVoted: true });
  },

  getProgressPercent: () => {
    const { voterPath, completedSteps } = get();
    const total = voterPath === 'newbie' ? NEWBIE_STEPS.length
      : voterPath === 'veteran' ? VETERAN_STEPS.length
      : 0;
    if (total === 0) return 0;
    return Math.round((completedSteps.length / total) * 100);
  },

  getCurrentSteps: () => {
    const { voterPath } = get();
    return voterPath === 'newbie' ? NEWBIE_STEPS
      : voterPath === 'veteran' ? VETERAN_STEPS
      : [];
  },
}));
