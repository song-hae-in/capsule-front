import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/use-wallet';
import {
  mockPinMetadata,
  mockRequestWalletSignature,
  mockSubmitOnchainRecord,
} from '../lib/mock-seal-pipeline';
import {
  DEFAULT_CAPSULE_DESIGN,
  DEFAULT_UNLOCK_RULE,
  INITIAL_CAPSULE_BUFFER,
  type CapsuleBuffer,
  type CapsuleDesignId,
  type CapsuleMetadataPayload,
  type UnlockRule,
} from '../types/create-capsule';
import type { MemoryFile } from '../types/memory-upload';
import { type FileCidRef, useMemoryFiles } from './use-memory-files';

function needsFileUpload(files: MemoryFile[]): boolean {
  return files.some(
    (item) => item.seal.status === 'ready_to_seal' || item.seal.status === 'failed',
  );
}

function toFileCidRefs(files: MemoryFile[]): FileCidRef[] {
  return files
    .filter((item) => item.seal.cid)
    .map((item) => ({
      name: item.file.name,
      cid: item.seal.cid!,
      category: item.category,
    }));
}

export function useCreateCapsule() {
  const { isConnected } = useWallet();
  const memory = useMemoryFiles();
  const { files, uploadAllToIpfs, markAllSealed, retryUpload } = memory;

  const [buffer, setBuffer] = useState<CapsuleBuffer>(INITIAL_CAPSULE_BUFFER);
  const [design, setDesign] = useState<CapsuleDesignId>(DEFAULT_CAPSULE_DESIGN);
  const [unlock, setUnlock] = useState<UnlockRule>(DEFAULT_UNLOCK_RULE);
  const [isSealing, setIsSealing] = useState(false);

  const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0);
  const isSealLocked = isSealing || buffer.onchain.status === 'confirmed';

  const pinMetadata = useCallback(
    async (fileRefs: FileCidRef[]) => {
      if (fileRefs.length === 0) {
        throw new Error('No file CIDs available for metadata');
      }

      setBuffer((prev) => ({
        ...prev,
        ipfs: { status: 'uploading', metadataCid: prev.ipfs.metadataCid, error: undefined },
      }));

      try {
        const payload: CapsuleMetadataPayload = {
          design,
          unlock,
          files: fileRefs,
          createdAt: new Date().toISOString(),
        };

        const metadataCid = await mockPinMetadata(payload);
        setBuffer((prev) => ({
          ...prev,
          ipfs: { status: 'ready', metadataCid },
        }));
        return metadataCid;
      } catch {
        setBuffer((prev) => ({
          ...prev,
          ipfs: {
            status: 'failed',
            metadataCid: prev.ipfs.metadataCid,
            error: 'Metadata pin failed',
          },
        }));
        throw new Error('Metadata pin failed');
      }
    },
    [design, unlock],
  );

  const submitOnchain = useCallback(
    async (metadataCid: string) => {
      setBuffer((prev) => ({
        ...prev,
        onchain: { status: 'awaiting_signature', error: undefined },
      }));

      toast.message('Confirm the transaction in MetaMask');

      try {
        await mockRequestWalletSignature();
      } catch {
        setBuffer((prev) => ({
          ...prev,
          onchain: { status: 'failed', error: 'Signature rejected' },
        }));
        toast.error('Transaction rejected');
        throw new Error('Signature rejected');
      }

      setBuffer((prev) => ({
        ...prev,
        onchain: { status: 'submitting' },
      }));

      try {
        const txHash = await mockSubmitOnchainRecord(metadataCid);
        setBuffer((prev) => ({
          ...prev,
          onchain: { status: 'confirmed', txHash },
        }));
        markAllSealed();
        toast.success('Capsule sealed on-chain');
      } catch {
        setBuffer((prev) => ({
          ...prev,
          onchain: { status: 'failed', error: 'On-chain record failed' },
        }));
        toast.error('On-chain record failed');
        throw new Error('On-chain record failed');
      }
    },
    [markAllSealed],
  );

  const sealCapsule = useCallback(async () => {
    if (!isConnected) {
      toast.error('Connect your wallet before sealing');
      return;
    }

    if (files.length === 0) {
      toast.error('Add at least one memory');
      return;
    }

    if (isSealing || buffer.onchain.status === 'confirmed') return;

    setIsSealing(true);

    try {
      let fileRefs = toFileCidRefs(files);

      if (needsFileUpload(files)) {
        fileRefs = await uploadAllToIpfs();
        toast.success('All memories pinned to IPFS');
      }

      let metadataCid = buffer.ipfs.metadataCid;

      if (buffer.ipfs.status !== 'ready' || !metadataCid) {
        metadataCid = await pinMetadata(fileRefs);
        toast.success('Metadata pinned to IPFS');
      }

      if (buffer.onchain.status === 'idle' || buffer.onchain.status === 'failed') {
        await submitOnchain(metadataCid);
      }
    } catch {
      toast.error('Seal failed — check status below and retry if needed');
    } finally {
      setIsSealing(false);
    }
  }, [
    buffer.ipfs.metadataCid,
    buffer.ipfs.status,
    buffer.onchain.status,
    files,
    isConnected,
    isSealing,
    pinMetadata,
    submitOnchain,
    uploadAllToIpfs,
  ]);

  const retryBlockchainRecord = useCallback(async () => {
    if (!isConnected) {
      toast.error('Connect your wallet before retrying');
      return;
    }

    const metadataCid = buffer.ipfs.metadataCid;
    if (buffer.ipfs.status !== 'ready' || !metadataCid) return;
    if (isSealing) return;

    setIsSealing(true);
    try {
      await submitOnchain(metadataCid);
    } finally {
      setIsSealing(false);
    }
  }, [buffer.ipfs.metadataCid, buffer.ipfs.status, isConnected, isSealing, submitOnchain]);

  const retryMetadataPin = useCallback(async () => {
    if (needsFileUpload(files)) {
      toast.error('Upload all files to IPFS first');
      return;
    }
    if (isSealing) return;

    const fileRefs = toFileCidRefs(files);
    if (fileRefs.length === 0) return;

    setIsSealing(true);
    try {
      await pinMetadata(fileRefs);
      toast.success('Metadata pinned to IPFS');
    } catch {
      toast.error('Metadata pin failed');
    } finally {
      setIsSealing(false);
    }
  }, [files, isSealing, pinMetadata]);

  return {
    ...memory,
    buffer,
    design,
    unlock,
    setDesign,
    setUnlock,
    totalBytes,
    isSealing,
    isSealLocked,
    sealCapsule,
    retryBlockchainRecord,
    retryMetadataPin,
    retryUpload,
  };
}
