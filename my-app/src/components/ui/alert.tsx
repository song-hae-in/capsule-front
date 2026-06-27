import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AlertVariant = 'default' | 'success' | 'warning' | 'destructive';

const variantStyles: Record<AlertVariant, string> = {
  default: 'border-primary/30 bg-primary/10 text-foreground',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-foreground',
  warning: 'border-amber-500/30 bg-amber-500/10 text-foreground',
  destructive: 'border-red-500/30 bg-red-500/10 text-foreground',
};

const iconStyles: Record<AlertVariant, string> = {
  default: 'text-primary',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  destructive: 'text-red-500',
};

const icons: Record<AlertVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: XCircle,
};

type AlertProps = {
  variant?: AlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

/**
 * 인라인 알림 — 페이지 안에 고정 표시할 때 사용.
 * 잠깐 뜨는 토스트는 useAlert() 사용.
 */
export function Alert({
  variant = 'default',
  title,
  description,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex gap-3 rounded-xl border px-4 py-3 text-sm',
        variantStyles[variant],
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconStyles[variant])} aria-hidden />

      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium leading-snug">{title}</p> : null}
        {description ? (
          <p className={cn('leading-snug text-muted-foreground', title ? 'mt-1' : undefined)}>
            {description}
          </p>
        ) : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
