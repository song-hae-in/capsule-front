import { useContext } from 'react';
import { AlertContext } from '../providers/alert-provider';
import type { AlertContextValue } from '../types/alert';

/**
 * 전역 토스트 알림 훅.
 *
 * @example
 * const { alert } = useAlert();
 * alert({ variant: 'success', title: 'Saved', description: 'Changes applied.' });
 */
export function useAlert(): AlertContextValue {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }

  return context;
}
