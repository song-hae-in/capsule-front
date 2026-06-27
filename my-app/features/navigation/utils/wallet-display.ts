/** 연결된 지갑 주소마다 고정되는 샘플 아바타 URL */
import type { WalletState } from '../../../src/types/wallet';

const AVATAR_SEEDS = [
  'capsule-profile-1',
  'capsule-profile-2',
  'capsule-profile-3',
  'capsule-profile-4',
  'capsule-profile-5',
  'capsule-profile-6',
  'capsule-profile-7',
  'capsule-profile-8',
];

export function getWalletAvatarUrl(address: string): string {
  const index = Number.parseInt(address.slice(2, 10), 16) % AVATAR_SEEDS.length;
  return `https://picsum.photos/seed/${AVATAR_SEEDS[index]}/80/80`;
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function getWalletStatusLabel(
  status: WalletState['status'],
  chainName: string | null,
): string {
  if (status === 'connecting') return 'Connecting…';
  if (status === 'error') return 'Error';
  return chainName ?? 'Connected';
}

function getExplorerUrl(address: string): string {
  // TODO: chainId별 explorer 분기
  return `https://sepolia.etherscan.io/address/${address}`;
}

export { getExplorerUrl };
