import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmoothTab, { type TabItem } from '@/components/kokonutui/smooth-tab';
import { Button } from '@/components/ui/button';
import { WIZARD_STEPS, type WizardStepId } from '../constants/wizard-steps';
import { useCreateCapsuleWizard } from '../hooks/use-create-capsule-wizard';
import type { useCreateCapsule } from '../hooks/use-create-capsule';
import AddMemoriesStep from './steps/add-memories-step';
import ChooseDesignStep from './steps/choose-design-step';
import ReviewSealStep from './steps/review-seal-step';
import SetUnlockDateStep from './steps/set-unlock-date-step';
import ValidateStep from './steps/validate-step';

type CreateCapsuleWizardProps = {
  capsule: ReturnType<typeof useCreateCapsule>;
};

export default function CreateCapsuleWizard({ capsule }: CreateCapsuleWizardProps) {
  const {
    files,
    addFiles,
    removeFile,
    buffer,
    design,
    unlock,
    totalBytes,
    isSealing,
    isSealLocked,
    sealCapsule,
    retryBlockchainRecord,
    retryMetadataPin,
    retryUpload,
    setUnlock,
  } = capsule;

  const wizard = useCreateCapsuleWizard({ files, unlock, isSealLocked });
  const {
    currentStepId,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStepId,
    canAccessStep,
    canProceedFromStep,
  } = wizard;

  const tabItems = useMemo<TabItem[]>(
    () =>
      WIZARD_STEPS.map((step) => ({
        id: step.id,
        title: step.shortTitle,
        description: step.description,
        color: 'bg-primary hover:bg-primary/90',
        cardContent: renderStepContent(step.id, {
          files,
          addFiles,
          removeFile,
          buffer,
          design,
          unlock,
          totalBytes,
          isSealing,
          isSealLocked,
          sealCapsule,
          retryBlockchainRecord,
          retryMetadataPin,
          retryUpload,
          setUnlock,
        }),
      })),
    [
      addFiles,
      buffer,
      design,
      files,
      isSealLocked,
      isSealing,
      removeFile,
      retryBlockchainRecord,
      retryMetadataPin,
      retryUpload,
      sealCapsule,
      setUnlock,
      totalBytes,
      unlock,
    ],
  );

  return (
    <SmoothTab
      cardClassName="min-h-[280px] border-0 bg-transparent ring-0"
      className="w-full"
      footer={
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isFirstStep || isSealLocked}
            className="gap-1"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>

          {!isLastStep ? (
            <Button type="button" onClick={goNext} disabled={!canProceedFromStep} className="gap-1">
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">Use Seal Capsule above to finish</span>
          )}
        </div>
      }
      indicator="tabs"
      isTabEnabled={(_tabId, index) => canAccessStep(index)}
      items={tabItems}
      onValueChange={(stepId) => goToStepId(stepId as WizardStepId)}
      value={currentStepId}
      variant="wizard"
    />
  );
}

type StepRenderContext = {
  files: ReturnType<typeof useCreateCapsule>['files'];
  addFiles: ReturnType<typeof useCreateCapsule>['addFiles'];
  removeFile: ReturnType<typeof useCreateCapsule>['removeFile'];
  buffer: ReturnType<typeof useCreateCapsule>['buffer'];
  design: ReturnType<typeof useCreateCapsule>['design'];
  unlock: ReturnType<typeof useCreateCapsule>['unlock'];
  totalBytes: number;
  isSealing: boolean;
  isSealLocked: boolean;
  sealCapsule: ReturnType<typeof useCreateCapsule>['sealCapsule'];
  retryBlockchainRecord: ReturnType<typeof useCreateCapsule>['retryBlockchainRecord'];
  retryMetadataPin: ReturnType<typeof useCreateCapsule>['retryMetadataPin'];
  retryUpload: ReturnType<typeof useCreateCapsule>['retryUpload'];
  setUnlock: ReturnType<typeof useCreateCapsule>['setUnlock'];
};

function renderStepContent(stepId: WizardStepId, ctx: StepRenderContext) {
  switch (stepId) {
    case 'memories':
      return (
        <AddMemoriesStep
          files={ctx.files}
          onFilesSelect={ctx.addFiles}
          onRemove={ctx.removeFile}
          disabled={ctx.isSealLocked}
        />
      );
    case 'unlock':
      return (
        <SetUnlockDateStep
          unlock={ctx.unlock}
          onUnlockChange={ctx.setUnlock}
          disabled={ctx.isSealLocked}
        />
      );
    case 'design':
      return <ChooseDesignStep />;
    case 'validate':
      return (
        <ValidateStep
          files={ctx.files}
          totalBytes={ctx.totalBytes}
          design={ctx.design}
          unlock={ctx.unlock}
        />
      );
    case 'review':
      return (
        <ReviewSealStep
          embedded
          files={ctx.files}
          buffer={ctx.buffer}
          design={ctx.design}
          unlock={ctx.unlock}
          totalBytes={ctx.totalBytes}
          isSealing={ctx.isSealing}
          onSeal={ctx.sealCapsule}
          onRetryBlockchain={ctx.retryBlockchainRecord}
          onRetryMetadata={ctx.retryMetadataPin}
          onRetryFile={ctx.retryUpload}
        />
      );
    default:
      return null;
  }
}
