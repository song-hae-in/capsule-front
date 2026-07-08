import type { CapsuleDesignId } from './create-capsule';

/**
 * List 페이지가 소비하는 캡슐 요약.
 * 온체인 조회(getMyCapsules)와 localStorage mock 양쪽에서 이 형태로 변환한다.
 */
export type CapsuleSummary = {
  id: string;
  /** 컨트랙트의 ipfsHash — metadata JSON CID */
  metadataCid: string;
  /** ISO datetime */
  unlockAt: string;
  isOpened: boolean;
  /** 아래는 metadata(또는 로컬 기록)에서 오는 enrichment — 온체인에는 없음 */
  design?: CapsuleDesignId;
  fileCount?: number;
  createdAt?: string;
  txHash?: string;
  source: 'onchain' | 'local';
};

export type CapsuleState = 'locked' | 'unlockable' | 'opened';

export function getCapsuleState(summary: Pick<CapsuleSummary, 'unlockAt' | 'isOpened'>): CapsuleState {
  if (summary.isOpened) return 'opened';
  if (new Date(summary.unlockAt).getTime() <= Date.now()) return 'unlockable';
  return 'locked';
}

export const CAPSULE_STATE_LABELS: Record<CapsuleState, string> = {
  locked: 'Locked',
  unlockable: 'Ready to open',
  opened: 'Opened',
};
