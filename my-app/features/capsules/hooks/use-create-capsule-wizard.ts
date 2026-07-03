import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  WIZARD_STEP_IDS,
  wizardStepIdAt,
  wizardStepIndex,
  type WizardStepId,
} from '../constants/wizard-steps';
import { isUnlockInFuture } from '../lib/unlock-date';
import type { UnlockRule } from '../types/create-capsule';
import type { MemoryFile } from '../types/memory-upload';

const UNLOCK_STEP_INDEX = wizardStepIndex('unlock');

type UseCreateCapsuleWizardOptions = {
  files: MemoryFile[];
  unlock: UnlockRule;
  isSealLocked: boolean;
};

function stepBlockedMessage(stepId: WizardStepId, unlock: UnlockRule): string | null {
  if (stepId === 'memories') return 'Add at least one memory to continue';
  if (stepId === 'unlock') {
    if (!isUnlockInFuture(unlock.unlockAt)) return 'Unlock date must be in the future';
    if (!unlock.unlockConfirmed) return 'Confirm your unlock date to continue';
  }
  return null;
}

export function useCreateCapsuleWizard({
  files,
  unlock,
  isSealLocked,
}: UseCreateCapsuleWizardOptions) {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);

  const currentStepId = wizardStepIdAt(stepIndex);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === WIZARD_STEP_IDS.length - 1;

  const canProceedFromStep = useCallback(
    (index: number) => {
      const stepId = wizardStepIdAt(index);
      if (stepId === 'memories') return files.length > 0;
      if (stepId === 'unlock') {
        return isUnlockInFuture(unlock.unlockAt) && unlock.unlockConfirmed === true;
      }
      return true;
    },
    [files.length, unlock.unlockAt, unlock.unlockConfirmed],
  );

  useEffect(() => {
    if (!unlock.unlockConfirmed) {
      setMaxReachedStep((prev) => Math.min(prev, UNLOCK_STEP_INDEX));
    }
  }, [unlock.unlockConfirmed]);

  const canAccessStep = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= WIZARD_STEP_IDS.length) return false;
      if (targetIndex <= stepIndex) return true;
      if (targetIndex > maxReachedStep) return false;
      return canProceedFromStep(stepIndex);
    },
    [canProceedFromStep, maxReachedStep, stepIndex],
  );

  const notifyStepBlocked = useCallback(
    (index: number) => {
      const message = stepBlockedMessage(wizardStepIdAt(index), unlock);
      if (message) toast.error(message);
    },
    [unlock],
  );

  const goToStep = useCallback(
    (targetIndex: number) => {
      if (isSealLocked && targetIndex < stepIndex) return;
      if (!canAccessStep(targetIndex)) {
        if (targetIndex > stepIndex) notifyStepBlocked(stepIndex);
        return;
      }

      setStepIndex(targetIndex);
    },
    [canAccessStep, isSealLocked, notifyStepBlocked, stepIndex],
  );

  const goToStepId = useCallback(
    (stepId: WizardStepId) => {
      goToStep(wizardStepIndex(stepId));
    },
    [goToStep],
  );

  const goNext = useCallback(() => {
    if (!canProceedFromStep(stepIndex)) {
      notifyStepBlocked(stepIndex);
      return;
    }

    if (isLastStep) return;

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setMaxReachedStep((prev) => Math.max(prev, nextIndex));
  }, [canProceedFromStep, isLastStep, notifyStepBlocked, stepIndex]);

  const goBack = useCallback(() => {
    if (isFirstStep || isSealLocked) return;
    setStepIndex((prev) => prev - 1);
  }, [isFirstStep, isSealLocked]);

  return {
    currentStepId,
    stepIndex,
    maxReachedStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    goToStepId,
    canAccessStep,
    canProceedFromStep: canProceedFromStep(stepIndex),
  };
}
