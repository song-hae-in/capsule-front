/**
 * Capsule-level seal pipeline. IPFS upload and onchain record run only at Review & Seal.
 */
export type BufferIpfsStatus = 'idle' | 'uploading' | 'ready' | 'failed';

export type BufferOnchainStatus =
  | 'idle'
  | 'awaiting_signature'
  | 'submitting'
  | 'failed'
  | 'confirmed';

export type CapsuleBuffer = {
  ipfs: {
    status: BufferIpfsStatus;
    metadataCid?: string;
    error?: string;
  };
  onchain: {
    status: BufferOnchainStatus;
    txHash?: string;
    error?: string;
  };
};

export const INITIAL_CAPSULE_BUFFER: CapsuleBuffer = {
  ipfs: { status: 'idle' },
  onchain: { status: 'idle' },
};

export type CapsuleDesignId =
  | 'glass-orb'
  | 'cosmic-vault'
  | 'crystal-cube'
  | 'ancient-archive'
  | 'hologram-capsule';

export const CAPSULE_DESIGN_LABELS: Record<CapsuleDesignId, string> = {
  'glass-orb': 'Glass Orb',
  'cosmic-vault': 'Cosmic Vault',
  'crystal-cube': 'Crystal Cube',
  'ancient-archive': 'Ancient Archive',
  'hologram-capsule': 'Hologram Capsule',
};

export type UnlockRule = {
  unlockAt?: string;
  allowedWallet?: `0x${string}`;
  secretCode?: string;
  visibility: 'public' | 'private';
  encrypted?: boolean;
};

export const DEFAULT_UNLOCK_RULE: UnlockRule = {
  visibility: 'private',
  encrypted: true,
};

export const DEFAULT_CAPSULE_DESIGN: CapsuleDesignId = 'glass-orb';

export type CapsuleMetadataPayload = {
  design: CapsuleDesignId;
  unlock: UnlockRule;
  files: Array<{ name: string; cid: string; category: string }>;
  createdAt: string;
};
