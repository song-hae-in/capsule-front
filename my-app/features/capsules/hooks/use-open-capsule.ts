/**
 * useOpenCapsule — 캡슐 개봉 트랜잭션 훅
 * wagmi writeContractAsync로 openCapsule 호출
 */
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { sepolia } from 'wagmi/chains';
import {
  TIME_CAPSULE_ABI,
  TIME_CAPSULE_ADDRESS,
} from '@/config/timecapsule';
import { wagmiConfig } from '@/config/wagmi';

export type OpenCapsuleStatus = 'idle' | 'awaiting_signature' | 'submitting' | 'confirmed' | 'failed';

export function useOpenCapsule() {
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<OpenCapsuleStatus>('idle');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const openCapsule = useCallback(async (capsuleId: string | number) => {
    setStatus('awaiting_signature');
    setError(undefined);
    setTxHash(undefined);

    toast.message('MetaMask에서 개봉 트랜잭션을 확인해주세요');

    try {
      const hash = await writeContractAsync({
        abi: TIME_CAPSULE_ABI,
        address: TIME_CAPSULE_ADDRESS as `0x${string}`,
        chainId: sepolia.id,
        functionName: 'openCapsule',
        args: [BigInt(capsuleId)],
      });

      setTxHash(hash);
      setStatus('submitting');

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: sepolia.id,
        hash: hash as `0x${string}`,
      });

      setStatus('confirmed');
      toast.success('캡슐이 개봉되었습니다! 🎉');
    } catch (err: unknown) {
      setStatus('failed');
      const message = err instanceof Error ? err.message : '개봉 트랜잭션 실패';

      if (message.includes('User rejected') || message.includes('rejected')) {
        setError('사용자가 트랜잭션을 거부했습니다');
        toast.error('트랜잭션이 취소되었습니다');
      } else if (message.includes('개봉 시점이 도래하지 않았습니다')) {
        setError('아직 개봉 시점이 되지 않았습니다');
        toast.error('개봉 시점이 도래하지 않았습니다');
      } else if (message.includes('캡슐 소유자만')) {
        setError('캡슐 소유자만 개봉할 수 있습니다');
        toast.error('캡슐 소유자만 개봉할 수 있습니다');
      } else if (message.includes('이미 개봉된')) {
        setError('이미 개봉된 캡슐입니다');
        toast.error('이미 개봉된 캡슐입니다');
      } else {
        setError(message);
        toast.error('개봉 실패: ' + message);
      }
    }
  }, [writeContractAsync]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxHash(undefined);
    setError(undefined);
  }, []);

  return {
    status,
    txHash,
    error,
    openCapsule,
    reset,
  };
}
