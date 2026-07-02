export type MemoryFileCategory = 'photo' | 'document' | 'other';

/**
 * Per-file status across the create-capsule flow.
 * Step 1 ends at `ready_to_seal`. Seal phases run after Review & Seal.
 */
export type MemoryFileStatus =
  | 'ready_to_seal'
  | 'checking'
  | 'invalid'
  | 'encrypting'
  | 'hashing'
  | 'uploading'
  | 'ipfs_ready'
  | 'sealed'
  | 'failed';

export type MemoryFile = {
  id: string;
  file: File;
  category: MemoryFileCategory;
  previewUrl?: string;
  seal: {
    status: MemoryFileStatus;
    progress: number;
    cid?: string;
    error?: string;
  };
};

export function getMemoryFileCategory(file: File): MemoryFileCategory {
  if (file.type.startsWith('image/')) return 'photo';
  if (
    file.type === 'application/pdf' ||
    file.type.includes('document') ||
    file.type.includes('sheet') ||
    file.type === 'text/plain'
  ) {
    return 'document';
  }
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function createMemoryFile(file: File): MemoryFile {
  const category = getMemoryFileCategory(file);
  return {
    id: crypto.randomUUID(),
    file,
    category,
    previewUrl: category === 'photo' ? URL.createObjectURL(file) : undefined,
    seal: {
      status: 'ready_to_seal',
      progress: 0,
    },
  };
}

export function validateMemoryFile(
  file: File,
  maxFileSize: number,
): { message: string; code: string } | null {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isText = file.type === 'text/plain';
  const isOffice =
    file.type.includes('document') ||
    file.type.includes('sheet') ||
    file.type === 'application/msword';

  if (!isImage && !isPdf && !isText && !isOffice) {
    return {
      message: 'Images, PDF, or documents only.',
      code: 'INVALID_FILE_TYPE',
    };
  }

  if (file.size > maxFileSize) {
    return {
      message: `Max file size is ${formatFileSize(maxFileSize)}.`,
      code: 'FILE_TOO_LARGE',
    };
  }

  return null;
}

/** Step 1 — local buffer only; removable and not yet sent to IPFS. */
export function isLocalBufferStatus(status: MemoryFileStatus): boolean {
  return status === 'ready_to_seal' || status === 'checking' || status === 'invalid';
}

/** Seal in progress — disable remove and edits. */
export function isSealLockedStatus(status: MemoryFileStatus): boolean {
  return (
    status === 'encrypting' ||
    status === 'hashing' ||
    status === 'uploading' ||
    status === 'sealed'
  );
}
