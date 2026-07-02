const MOCK_FAIL_RATE = 0; // 테스트 시 0.1 등으로 조정

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * IPFS pin 시뮬레이션. 실제 API 연동 전 progress/CID UX 검증용.
 */
export async function mockPinToIpfs(
  file: File,
  onProgress: (progress: number) => void,
): Promise<string> {
  const steps = 20;

  for (let step = 1; step <= steps; step += 1) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 60 + Math.random() * 50);
    });
    onProgress(Math.round((step / steps) * 100));
  }

  if (MOCK_FAIL_RATE > 0 && Math.random() < MOCK_FAIL_RATE) {
    throw new Error('Mock IPFS upload failed');
  }

  const digest = hashString(`${file.name}-${file.size}-${file.lastModified}`);
  return `bafybeig${digest}${hashString(file.type).slice(0, 4)}`;
}
