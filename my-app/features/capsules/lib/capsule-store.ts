import type { CapsuleDesignId } from '../types/create-capsule';

/**
 * Seal 완료된 캡슐의 localStorage 기록.
 *
 * 컨트랙트 배포 전 mock 단계에서는 List 페이지의 유일한 데이터 소스이고,
 * 온체인 전환 후에는 온체인에 없는 필드(design, fileCount)의 enrichment 캐시로 쓴다.
 */
export type LocalCapsuleRecord = {
  id: string;
  /** 소유 지갑 주소 (lowercase 비교) */
  owner: string;
  metadataCid: string;
  txHash?: string;
  /** ISO datetime */
  unlockAt: string;
  createdAt: string;
  design: CapsuleDesignId;
  fileCount: number;
  isOpened: boolean;
};

const STORAGE_KEY = 'capsule:sealed';

function loadAll(): LocalCapsuleRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalCapsuleRecord[]) : [];
  } catch {
    return [];
  }
}

export function loadLocalCapsules(owner: string): LocalCapsuleRecord[] {
  const target = owner.toLowerCase();
  return loadAll().filter((record) => record.owner.toLowerCase() === target);
}

export function saveLocalCapsule(record: LocalCapsuleRecord): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...loadAll(), record]));
  } catch {
    // storage 실패(용량 등)는 seal 결과에 영향 주지 않도록 무시
  }
}

/** metadataCid 기준 enrichment 조회용 맵 */
export function buildLocalCapsuleMap(owner: string): Map<string, LocalCapsuleRecord> {
  return new Map(loadLocalCapsules(owner).map((record) => [record.metadataCid, record]));
}
