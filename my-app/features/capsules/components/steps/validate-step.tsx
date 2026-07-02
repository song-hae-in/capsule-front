import { WizardScaffoldCard, WizardStepShell } from './wizard-step-shell';
import { CAPSULE_DESIGN_LABELS, type CapsuleDesignId, type UnlockRule } from '../../types/create-capsule';
import { formatFileSize, type MemoryFile } from '../../types/memory-upload';

type ValidateStepProps = {
  files: MemoryFile[];
  totalBytes: number;
  design: CapsuleDesignId;
  unlock: UnlockRule;
};

export default function ValidateStep({ files, totalBytes, design, unlock }: ValidateStepProps) {
  return (
    <WizardStepShell
      title="Validate"
      description="Quick check before you review and seal on-chain."
    >
      <WizardScaffoldCard
        title="Pre-seal checklist"
        items={[
          `${files.length} memor${files.length === 1 ? 'y' : 'ies'} · ${formatFileSize(totalBytes)} total`,
          `Design: ${CAPSULE_DESIGN_LABELS[design]}`,
          `Visibility: ${unlock.visibility}${unlock.encrypted ? ' · encrypted' : ''}`,
          'Wallet connected',
          'Ready for IPFS + on-chain seal',
        ]}
      />
    </WizardStepShell>
  );
}
