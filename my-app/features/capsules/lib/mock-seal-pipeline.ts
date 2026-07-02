import type { CapsuleMetadataPayload } from '../types/create-capsule';

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/** Metadata JSON pin simulation (Step 4 — after per-file CIDs exist). */
export async function mockPinMetadata(
  payload: CapsuleMetadataPayload,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const steps = 12;

  for (let step = 1; step <= steps; step += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    onProgress?.(Math.round((step / steps) * 100));
  }

  const digest = hashString(JSON.stringify(payload));
  return `bafybeimeta${digest}`;
}

/** MetaMask signature simulation. */
export async function mockRequestWalletSignature(): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 1200));
}

/** Onchain seal transaction simulation. */
export async function mockSubmitOnchainRecord(metadataCid: string): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 1500));
  return `0x${hashString(metadataCid)}${hashString('seal').slice(0, 8)}`;
}
