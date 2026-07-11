/**
 * Pinata API를 통한 실제 IPFS 파일 업로드.
 * 환경변수: VITE_PINATA_API_KEY, VITE_PINATA_SECRET_KEY
 */

const PINATA_API_URL = 'https://api.pinata.cloud';

function getApiKeys() {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY ?? '';
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY ?? '';
  return { apiKey, secretKey };
}

/**
 * 단일 파일을 Pinata에 업로드하여 CID를 반환한다.
 * onProgress 콜백으로 진행률(0~100)을 전달한다.
 */
export async function pinFileToIpfs(
  file: File,
  onProgress: (progress: number) => void,
): Promise<string> {
  const { apiKey, secretKey } = getApiKeys();

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API 키가 설정되지 않았습니다. .env에 VITE_PINATA_API_KEY, VITE_PINATA_SECRET_KEY를 설정해주세요.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'pinataMetadata',
    JSON.stringify({ name: file.name }),
  );

  onProgress(10); // 업로드 시작

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  onProgress(80); // 서버 응답 대기 완료

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Pinata API 키 인증 실패. 키를 확인해주세요.');
    }
    throw new Error(`IPFS 업로드 실패 (${response.status})`);
  }

  const data = await response.json();
  onProgress(100);

  return data.IpfsHash as string;
}
