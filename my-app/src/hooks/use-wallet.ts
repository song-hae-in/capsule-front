import { useContext } from 'react';
import { WalletContext } from '../providers/wallet-provider';
import type { WalletContextValue } from '../types/wallet';

/**
 * WalletProvider 컨텍스트 소비 훅.
 * navigation 등 UI 컴포넌트에서 사용 — 로직은 WalletProvider에 위임.
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}
