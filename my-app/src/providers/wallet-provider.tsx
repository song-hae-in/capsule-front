import {
  createContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import type { WalletContextValue, WalletState, WalletStatus } from '../types/wallet';

export const WalletContext = createContext<WalletContextValue | null>(null);

type WalletProviderProps = {
  children: ReactNode;
};

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function mapWalletStatus(
  isConnected: boolean,
  isConnecting: boolean,
  isConnectPending: boolean,
): WalletStatus {
  if (isConnecting || isConnectPending) return 'connecting';
  if (isConnected) return 'connected';
  return 'disconnected';
}

/**
 * wagmi hook → Capsule useWallet() context.
 * WagmiProvider 하위에서만 마운트 (app-providers.tsx).
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const { address, chain, isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors, isPending, error } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const connect = useCallback(async (): Promise<boolean> => {
    const connector = connectors[0];
    if (!connector) return false;

    try {
      await connectAsync({ connector });
      return true;
    } catch {
      return false;
    }
  }, [connectAsync, connectors]);

  const disconnect = useCallback(async (): Promise<void> => {
    await disconnectAsync();
  }, [disconnectAsync]);

  const wallet = useMemo<WalletState>(
    () => ({
      status: mapWalletStatus(isConnected, isConnecting, isPending),
      address: address ?? null,
      chainName: chain?.name ?? null,
      error: error?.message ?? null,
    }),
    [address, chain, error, isConnected, isConnecting, isPending],
  );

  const getConnectButtonLabel = useCallback((): string => {
    if (wallet.status === 'connecting') return 'Connecting…';
    if (wallet.address) return formatAddress(wallet.address);
    return 'Connect Wallet';
  }, [wallet.address, wallet.status]);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      connect,
      disconnect,
      getConnectButtonLabel,
      isConnected,
      isConnecting: wallet.status === 'connecting',
    }),
    [wallet, connect, disconnect, getConnectButtonLabel, isConnected],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
