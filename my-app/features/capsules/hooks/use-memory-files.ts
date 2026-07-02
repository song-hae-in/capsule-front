import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { mockPinToIpfs } from '../lib/mock-ipfs-upload';
import {
  createMemoryFile,
  validateMemoryFile,
  type MemoryFile,
  type MemoryFileCategory,
} from '../types/memory-upload';

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024;

export type FileCidRef = {
  name: string;
  cid: string;
  category: MemoryFileCategory;
};

type UseMemoryFilesOptions = {
  maxFileSize?: number;
};

export function useMemoryFiles({ maxFileSize = DEFAULT_MAX_FILE_SIZE }: UseMemoryFilesOptions = {}) {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const activeUploadsRef = useRef<Set<string>>(new Set());

  const updateFileSeal = useCallback((id: string, patch: Partial<MemoryFile['seal']>) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, seal: { ...item.seal, ...patch } } : item,
      ),
    );
  }, []);

  /** Review & Seal — IPFS upload for a single file (not called on file select). */
  const uploadFileToIpfs = useCallback(
    async (memoryFile: MemoryFile): Promise<string> => {
      const { id, file } = memoryFile;
      if (activeUploadsRef.current.has(id)) {
        return memoryFile.seal.cid ?? '';
      }

      activeUploadsRef.current.add(id);
      updateFileSeal(id, { status: 'uploading', progress: 0, error: undefined });

      try {
        const cid = await mockPinToIpfs(file, (progress) => {
          updateFileSeal(id, { progress });
        });

        updateFileSeal(id, {
          status: 'ipfs_ready',
          progress: 100,
          cid,
        });
        return cid;
      } catch {
        updateFileSeal(id, {
          status: 'failed',
          progress: 0,
          error: 'IPFS upload failed',
        });
        throw new Error(`Failed to upload ${file.name}`);
      } finally {
        activeUploadsRef.current.delete(id);
      }
    },
    [updateFileSeal],
  );

  const collectReadyFileRefs = useCallback((source: MemoryFile[]): FileCidRef[] => {
    return source
      .filter((item) => item.seal.cid)
      .map((item) => ({
        name: item.file.name,
        cid: item.seal.cid!,
        category: item.category,
      }));
  }, []);

  /** Review & Seal — encrypt, hash, then upload every local file to IPFS. */
  const uploadAllToIpfs = useCallback(async (): Promise<FileCidRef[]> => {
    const pending = files.filter(
      (item) => item.seal.status === 'ready_to_seal' || item.seal.status === 'failed',
    );
    const readyRefs = collectReadyFileRefs(files);

    if (pending.length === 0) return readyRefs;

    for (const item of pending) {
      updateFileSeal(item.id, { status: 'encrypting', error: undefined });
    }
    await new Promise((resolve) => window.setTimeout(resolve, 300));

    for (const item of pending) {
      updateFileSeal(item.id, { status: 'hashing' });
    }
    await new Promise((resolve) => window.setTimeout(resolve, 300));

    const uploaded: FileCidRef[] = [];

    for (const item of pending) {
      const cid = await uploadFileToIpfs(item);
      uploaded.push({ name: item.file.name, cid, category: item.category });
    }

    return [...readyRefs, ...uploaded];
  }, [collectReadyFileRefs, files, updateFileSeal, uploadFileToIpfs]);

  const addFile = useCallback(
    (file: File) => {
      const validationError = validateMemoryFile(file, maxFileSize);
      if (validationError) {
        toast.error(`${file.name}: ${validationError.message}`);
        return false;
      }

      const memoryFile = createMemoryFile(file);
      setFiles((prev) => [memoryFile, ...prev]);
      return true;
    },
    [maxFileSize],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;

      let added = 0;
      for (const file of incoming) {
        if (addFile(file)) added += 1;
      }

      if (added === 1) {
        toast.success('1 files added');
      } else if (added > 1) {
        toast.success(`${added} files added`);
      }
    },
    [addFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    activeUploadsRef.current.delete(id);
  }, []);

  const retryUpload = useCallback(
    (id: string) => {
      const target = files.find((item) => item.id === id);
      if (!target || target.seal.status === 'uploading') return;
      void uploadFileToIpfs(target).catch(() => {
        toast.error(`Failed to upload ${target.file.name}`);
      });
    },
    [files, uploadFileToIpfs],
  );

  const markAllSealed = useCallback(() => {
    setFiles((prev) =>
      prev.map((item) =>
        item.seal.status === 'ipfs_ready'
          ? { ...item, seal: { ...item.seal, status: 'sealed' } }
          : item,
      ),
    );
  }, []);

  useEffect(
    () => () => {
      for (const item of files) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    },
    [files],
  );

  return {
    files,
    addFile,
    addFiles,
    removeFile,
    retryUpload,
    uploadAllToIpfs,
    uploadFileToIpfs,
    markAllSealed,
  };
}
