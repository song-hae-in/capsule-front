import { useCallback, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import {
  isOnchainEnabled,
  TIME_CAPSULE_ABI,
  TIME_CAPSULE_ADDRESS,
} from '@/config/timecapsule';
import { useWallet } from '@/hooks/use-wallet';
import { buildLocalCapsuleMap, loadLocalCapsules } from '../lib/capsule-store';
import type { CapsuleSummary } from '../types/capsule-summary';

/**
 * 내 캡슐 목록.
 *
 * - `TIME_CAPSULE_ADDRESS` 설정됨 → 온체인 `getMyCapsules()` 조회
 *   (view지만 msg.sender 기반이므로 account를 넘겨 eth_call)
 * - 미설정(mock 단계) → Seal 시 저장한 localStorage 기록 사용
 */
export function useMyCapsules() {
  const { wallet, isConnected } = useWallet();
  const address = wallet.address;
  const onchain = isOnchainEnabled();

  // 로컬 모드에서 수동 새로고침용 (localStorage는 반응형이 아님)
  const [localVersion, setLocalVersion] = useState(0);

  // chainId 고정 — 지갑이 다른 네트워크에 있어도 항상 Sepolia에서 조회
  const read = useReadContract({
    abi: TIME_CAPSULE_ABI,
    address: (TIME_CAPSULE_ADDRESS || undefined) as `0x${string}` | undefined,
    chainId: sepolia.id,
    functionName: 'getMyCapsules',
    account: (address ?? undefined) as `0x${string}` | undefined,
    query: { enabled: onchain && Boolean(address) },
  });

  const capsules: CapsuleSummary[] = useMemo(() => {
    if (!address) return [];

    if (onchain) {
      const enrichment = buildLocalCapsuleMap(address);
      return (read.data ?? []).map((capsule) => {
        const local = enrichment.get(capsule.ipfsHash);
        return {
          id: capsule.id.toString(),
          metadataCid: capsule.ipfsHash,
          unlockAt: new Date(Number(capsule.unlockTime) * 1000).toISOString(),
          isOpened: capsule.isOpened,
          design: local?.design,
          fileCount: local?.fileCount,
          createdAt: local?.createdAt,
          txHash: local?.txHash,
          source: 'onchain' as const,
        };
      });
    }

    void localVersion;
    return loadLocalCapsules(address).map((record) => ({
      id: record.id,
      metadataCid: record.metadataCid,
      unlockAt: record.unlockAt,
      isOpened: record.isOpened,
      design: record.design,
      fileCount: record.fileCount,
      createdAt: record.createdAt,
      txHash: record.txHash,
      source: 'local' as const,
    }));
  }, [address, onchain, read.data, localVersion]);

  const refetch = useCallback(() => {
    if (onchain) {
      void read.refetch();
    } else {
      setLocalVersion((version) => version + 1);
    }
  }, [onchain, read]);

  return {
    capsules,
    isConnected,
    isLoading: onchain ? read.isLoading : false,
    isError: onchain ? read.isError : false,
    refetch,
    source: onchain ? ('onchain' as const) : ('local' as const),
  };
}
