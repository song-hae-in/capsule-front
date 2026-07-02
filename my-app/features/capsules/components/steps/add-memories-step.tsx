import MemoryFileUpload from '../memory-file-upload';
import { WizardStepShell } from './wizard-step-shell';
import type { MemoryFile } from '../../types/memory-upload';

type AddMemoriesStepProps = {
  files: MemoryFile[];
  onFilesSelect: (files: File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

export default function AddMemoriesStep({
  files,
  onFilesSelect,
  onRemove,
  disabled,
}: AddMemoriesStepProps) {
  return (
    <WizardStepShell
      title="Add Memories"
      description="Files stay in your browser until you seal the capsule."
    >
      <MemoryFileUpload
        files={files}
        onFilesSelect={onFilesSelect}
        onRemove={onRemove}
        disabled={disabled}
      />
    </WizardStepShell>
  );
}
