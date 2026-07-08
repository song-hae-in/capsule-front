/**
 * TimeCapsule 컨트랙트 설정.
 * 소스: https://github.com/jjaehyun2/blockcapsule/blob/main/contracts/contracts/TimeCapsule.sol
 *
 * 배포 후 TIME_CAPSULE_ADDRESS에 주소를 넣으면 List 페이지가
 * localStorage mock → 온체인 getMyCapsules() 조회로 전환된다.
 */

export const TIME_CAPSULE_ADDRESS: `0x${string}` | '' =
  '0x2dE53fd4ca1ff5a7705faDC2b65576DD1d76bc0d';

export function isOnchainEnabled(): boolean {
  return TIME_CAPSULE_ADDRESS.startsWith('0x');
}

const CAPSULE_STRUCT_COMPONENTS = [
  { name: 'id', type: 'uint256' },
  { name: 'owner', type: 'address' },
  { name: 'ipfsHash', type: 'string' },
  { name: 'unlockTime', type: 'uint256' },
  { name: 'isOpened', type: 'bool' },
] as const;

export const TIME_CAPSULE_ABI = [
  {
    type: 'function',
    name: 'createCapsule',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'ipfsHash', type: 'string' },
      { name: 'unlockTime', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'openCapsule',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'capsuleId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getMyCapsules',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: CAPSULE_STRUCT_COMPONENTS,
      },
    ],
  },
  {
    type: 'function',
    name: 'getCapsule',
    stateMutability: 'view',
    inputs: [{ name: 'capsuleId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: CAPSULE_STRUCT_COMPONENTS,
      },
    ],
  },
  {
    type: 'event',
    name: 'CapsuleCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'unlockTime', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CapsuleOpened',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
    ],
  },
] as const;
