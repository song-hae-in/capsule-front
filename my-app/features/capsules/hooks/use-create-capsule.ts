import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { sepolia } from 'wagmi/chains';
import {
  isOnchainEnabled,
  TIME_CAPSULE_ABI,
  TIME_CAPSULE_ADDRESS,
} from '@/config/timecapsule';
import { wagmiConfig } from '@/config/wagmi';
import { useWallet } from '@/hooks/use-wallet';
import { saveLocalCapsule } from '../lib/capsule-store';
import {
  pinMetadata as realPinMetadata,
  requestWalletSignature as mockRequestWalletSignature,
  submitOnchainRecord as mockSubmitOnchainRecord,
} from '../lib/seal-pipeline';
import {
  DEFAULT_CAPSULE_DESIGN,
  INITIAL_CAPSULE_BUFFER,
  type CapsuleBuffer,
  type CapsuleDesignId,
  type CapsuleMetadataPayload,
  type UnlockRule,
} from '../types/create-capsule';
import { createDefaultUnlockRule } from '../lib/unlock-date';
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
  const { isConnected, wallet } = useWallet();
  const { writeContractAsync } = useWriteContract();
  const memory = useMemoryFiles();
  const { files, uploadAllToIpfs, markAllSealed, retryUpload } = memory;

  const [buffer, setBuffer] = useState<CapsuleBuffer>(INITIAL_CAPSULE_BUFFER);
  const [design, setDesign] = useState<CapsuleDesignId>(DEFAULT_CAPSULE_DESIGN);
  const [unlock, setUnlock] = useState<UnlockRule>(createDefaultUnlockRule);
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

        const metadataCid = await realPinMetadata(payload);
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
      const onchain = isOnchainEnabled();

      setBuffer((prev) => ({
        ...prev,
        onchain: { status: 'awaiting_signature', error: undefined },
      }));

      toast.message('Confirm the transaction in MetaMask');

      // 1) 서명 단계 — 실제: MetaMask에서 createCapsule 서명·전송 / mock: 대기 시뮬레이션
      let txHash: string | undefined;
      try {
        if (onchain) {
          const unlockDate = unlock.unlockAt ? new Date(unlock.unlockAt) : new Date();
          // chainId 명시 — 지갑이 다른 네트워크에 있으면 서명 전에 Sepolia 전환 요청
          txHash = await writeContractAsync({
            abi: TIME_CAPSULE_ABI,
            address: TIME_CAPSULE_ADDRESS as `0x${string}`,
            chainId: sepolia.id,
            functionName: 'createCapsule',
            args: [metadataCid, BigInt(Math.floor(unlockDate.getTime() / 1000))],
          });
        } else {
          await mockRequestWalletSignature();
        }
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
        onchain: { status: 'submitting', txHash },
      }));

      // 2) 컨펌 단계 — 실제: receipt 대기 / mock: 가짜 txHash 생성
      try {
        if (onchain) {
          await waitForTransactionReceipt(wagmiConfig, {
            chainId: sepolia.id,
            hash: txHash as `0x${string}`,
          });
        } else {
          txHash = await mockSubmitOnchainRecord(metadataCid);
        }

        setBuffer((prev) => ({
          ...prev,
          onchain: { status: 'confirmed', txHash },
        }));
        markAllSealed();

        // List 페이지용 기록 — mock 모드에선 유일한 소스, 온체인 모드에선 design 등 enrichment 캐시
        if (wallet.address) {
          saveLocalCapsule({
            id: `local-${Date.now()}`,
            owner: wallet.address,
            metadataCid,
            txHash,
            unlockAt: unlock.unlockAt ?? new Date().toISOString(),
            createdAt: new Date().toISOString(),
            design,
            fileCount: files.length,
            isOpened: false,
          });
        }

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
    [design, files.length, markAllSealed, unlock.unlockAt, wallet.address, writeContractAsync],
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
