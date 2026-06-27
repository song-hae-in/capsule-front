import type { AlertVariant } from '../components/ui/alert';

export type AlertOptions = {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  /** ms. 기본 4000. 0이면 자동 닫힘 없음 */
  duration?: number;
};

export type AlertItem = AlertOptions & {
  id: string;
};

export type AlertContextValue = {
  /** 토스트 알림 표시 */
  alert: (options: AlertOptions) => string;
  dismiss: (id: string) => void;
};
