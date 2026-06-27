import { useWallet } from '../../../src/hooks/use-wallet';
import { useAlert } from '../../../src/hooks/use-alert';
import WalletProfileMenu from './wallet-profile-menu';

type WalletConnectButtonProps = {
  className?: string;
};

/**
 * 미연결: Connect Wallet 버튼 / 연결됨: h-9 원형 프로필 + 드롭다운.
 */
export default function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  const { connect, isConnected, isConnecting, wallet } = useWallet();
  const { alert } = useAlert();

  const handleConnect = async () => {
    const ok = await connect();
    if (!ok) {
      alert({
        variant: 'destructive',
        title: 'Wallet connection failed',
        description: wallet.error ?? 'MetaMask 연결을 확인해 주세요.',
      });
    }
  };

  if (isConnected) {
    return <WalletProfileMenu className={className} />;
  }

  return (
    <button
      type="button"
      className={`h-9 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 ${className}`}
      onClick={() => handleConnect()}
      disabled={isConnecting}
      aria-label="Connect wallet"
    >
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
