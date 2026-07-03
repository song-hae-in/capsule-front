import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/use-wallet';

type RequireWalletProps = {
  children: ReactNode;
};

/** Wallet 미연결 시 create 등 보호된 페이지 접근 차단 */
export default function RequireWallet({ children }: RequireWalletProps) {
  const { isConnected } = useWallet();

  useEffect(() => {
    if (!isConnected) {
      // StrictMode의 effect 이중 실행에도 같은 id면 토스트가 한 번만 표시됨
      toast.error('Connect your wallet to create a capsule', { id: 'require-wallet' });
    }
  }, [isConnected]);

  if (!isConnected) {
    return <Navigate replace to="/" />;
  }

  return children;
}
