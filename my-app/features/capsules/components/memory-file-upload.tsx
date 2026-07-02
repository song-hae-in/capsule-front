import { cn } from '@/lib/utils';
import type { MemoryFile } from '../types/memory-upload';
import { MemoryCardStack } from './memory-card';
import MemoryDropzone from './memory-dropzone';

type MemoryFileUploadProps = {
  files: MemoryFile[];
  onFilesSelect: (files: File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  className?: string;
  maxFileSize?: number;
};

/**
 * Step 1 — Dropzone + stacked memory cards. Files stay in local buffer until Review & Seal.
 */
export default function MemoryFileUpload({
  files,
  onFilesSelect,
  onRemove,
  disabled = false,
  className,
  maxFileSize,
}: MemoryFileUploadProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <MemoryDropzone
        onFilesSelect={onFilesSelect}
        maxFileSize={maxFileSize}
        disabled={disabled}
      />
      <MemoryCardStack files={files} onRemove={onRemove} />
    </div>
  );
}
