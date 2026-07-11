import type { CapsuleMetadataPayload } from '../types/create-capsule';

/**
 * IPFS 게이트웨이 조회 
 * .env의 VITE_PINATA_GATEWAY(전용 게이트웨이 도메인) 사용, 미설정 시 공개 게이트웨이.
 */
const gatewayHost =
  (import.meta.env.VITE_PINATA_GATEWAY as string | undefined)?.trim() ||
  'gateway.pinata.cloud';

const IPFS_GATEWAY = `https://${gatewayHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}/ipfs`;

export function ipfsUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

export async function fetchCapsuleMetadata(cid: string): Promise<CapsuleMetadataPayload> {
  const response = await fetch(ipfsUrl(cid));

  if (!response.ok) {
    throw new Error(`메타데이터 조회 실패 (${response.status})`);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as CapsuleMetadataPayload).files)
  ) {
    throw new Error('메타데이터 형식이 올바르지 않습니다');
  }

  return data as CapsuleMetadataPayload;
}
