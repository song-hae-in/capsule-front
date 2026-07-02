import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CheckCircle2,
  Images,
  Lock,
  Palette,
} from 'lucide-react';

export const WIZARD_STEP_IDS = [
  'memories',
  'unlock',
  'design',
  'validate',
  'review',
] as const;

export type WizardStepId = (typeof WIZARD_STEP_IDS)[number];

export type WizardStepConfig = {
  id: WizardStepId;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
};

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'memories',
    title: 'Add Memories',
    shortTitle: 'Memories',
    description: 'Upload photos and documents to your local buffer.',
    icon: Images,
  },
  {
    id: 'unlock',
    title: 'Set Unlock Date',
    shortTitle: 'Unlock',
    description: 'Choose when and how this capsule can be opened.',
    icon: CalendarClock,
  },
  {
    id: 'design',
    title: 'Choose Design',
    shortTitle: 'Design',
    description: 'Pick the visual style for your capsule.',
    icon: Palette,
  },
  {
    id: 'validate',
    title: 'Validate',
    shortTitle: 'Validate',
    description: 'Review your choices before sealing.',
    icon: CheckCircle2,
  },
  {
    id: 'review',
    title: 'Review & Seal Capsule',
    shortTitle: 'Seal',
    description: 'Encrypt, upload to IPFS, and record on-chain.',
    icon: Lock,
  },
];

export function wizardStepIndex(stepId: WizardStepId): number {
  return WIZARD_STEP_IDS.indexOf(stepId);
}

export function wizardStepIdAt(index: number): WizardStepId {
  return WIZARD_STEP_IDS[Math.min(Math.max(index, 0), WIZARD_STEP_IDS.length - 1)];
}
