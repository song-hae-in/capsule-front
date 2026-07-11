/**
 * 실제 Seal Pipeline — Pinata API를 통한 메타데이터 JSON pin.
 * mock-seal-pipeline.ts를 대체한다.
 */

import type { CapsuleMetadataPayload } from '../types/create-capsule';

const PINATA_API_URL = 'https://api.pinata.cloud';

function getApiKeys() {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY ?? '';
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY ?? '';
  return { apiKey, secretKey };
}

/**
 * 캡슐 메타데이터 JSON을 Pinata pinJSONToIPFS API로 업로드한다.
 * @returns metadataCid (IPFS CID)
 */
export async function pinMetadata(
  payload: CapsuleMetadataPayload,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { apiKey, secretKey } = getApiKeys();

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API 키가 설정되지 않았습니다.');
  }

  onProgress?.(20);

  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: JSON.stringify({
      pinataContent: payload,
      pinataMetadata: {
        name: `capsule-metadata-${Date.now()}`,
      },
    }),
  });

  onProgress?.(80);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Pinata API 키 인증 실패');
    }
    throw new Error(`메타데이터 pin 실패 (${response.status})`);
  }

  const data = await response.json();
  onProgress?.(100);

  return data.IpfsHash as string;
}

/**
 * MetaMask 서명 요청 — wagmi가 처리하므로 이 함수는 온체인 모드에서 사용되지 않음.
 * mock 모드 호환성을 위해 유지.
 */
export async function requestWalletSignature(): Promise<void> {
  // wagmi writeContractAsync가 직접 MetaMask 서명을 처리하므로 no-op
}

/**
 * mock 모드용 온체인 기록 시뮬레이션. 온체인 모드에서는 사용되지 않음.
 */
export async function submitOnchainRecord(metadataCid: string): Promise<string> {
  // 온체인 모드에서는 wagmi가 직접 처리
  await new Promise((resolve) => window.setTimeout(resolve, 1500));
  const hash = Array.from(metadataCid)
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}
