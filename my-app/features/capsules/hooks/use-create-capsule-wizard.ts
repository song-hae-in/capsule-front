import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  WIZARD_STEP_IDS,
  wizardStepIdAt,
  wizardStepIndex,
  type WizardStepId,
} from '../constants/wizard-steps';
import type { MemoryFile } from '../types/memory-upload';

type UseCreateCapsuleWizardOptions = {
  files: MemoryFile[];
  isSealLocked: boolean;
};

export function useCreateCapsuleWizard({ files, isSealLocked }: UseCreateCapsuleWizardOptions) {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);

  const currentStepId = wizardStepIdAt(stepIndex);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === WIZARD_STEP_IDS.length - 1;

  const canProceedFromStep = useCallback(
    (index: number) => {
      const stepId = wizardStepIdAt(index);
      if (stepId === 'memories') return files.length > 0;
      return true;
    },
    [files.length],
  );

  const goToStep = useCallback(
    (targetIndex: number) => {
      if (isSealLocked && targetIndex < stepIndex) return;
      if (targetIndex < 0 || targetIndex >= WIZARD_STEP_IDS.length) return;
      if (targetIndex > maxReachedStep) return;

      setStepIndex(targetIndex);
    },
    [isSealLocked, maxReachedStep, stepIndex],
  );

  const goToStepId = useCallback(
    (stepId: WizardStepId) => {
      goToStep(wizardStepIndex(stepId));
    },
    [goToStep],
  );

  const goNext = useCallback(() => {
    if (!canProceedFromStep(stepIndex)) {
      if (wizardStepIdAt(stepIndex) === 'memories') {
        toast.error('Add at least one memory to continue');
      }
      return;
    }

    if (isLastStep) return;

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setMaxReachedStep((prev) => Math.max(prev, nextIndex));
  }, [canProceedFromStep, isLastStep, stepIndex]);

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
    canProceedFromStep: canProceedFromStep(stepIndex),
  };
}
