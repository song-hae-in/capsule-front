import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../config/wagmi';
import { AlertProvider } from './alert-provider';
import { WalletProvider } from './wallet-provider';

type AppProvidersProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

/**
 * main.tsx 전역 Provider.
 * 순서: WagmiProvider → QueryClientProvider → WalletProvider → AlertProvider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <AlertProvider>{children}</AlertProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
