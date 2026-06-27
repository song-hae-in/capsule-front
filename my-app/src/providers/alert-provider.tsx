import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from '../components/ui/alert';
import type { AlertContextValue, AlertItem, AlertOptions } from '../types/alert';

export const AlertContext = createContext<AlertContextValue | null>(null);

type AlertProviderProps = {
  children: ReactNode;
};

const DEFAULT_DURATION = 4000;

function AlertToaster({
  items,
  onDismiss,
}: {
  items: AlertItem[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {items.map((item) => (
        <div key={item.id} className="animate-alert-in pointer-events-auto">
          <Alert
            variant={item.variant}
            title={item.title}
            description={item.description}
            onDismiss={() => onDismiss(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * 전역 토스트 알림 Provider.
 * useAlert().alert({ title, description, variant }) 로 호출.
 */
export function AlertProvider({ children }: AlertProviderProps) {
  const [items, setItems] = useState<AlertItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const alert = useCallback(
    (options: AlertOptions): string => {
      const id = crypto.randomUUID();
      const duration = options.duration ?? DEFAULT_DURATION;

      setItems((prev) => [...prev, { ...options, id }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const value = useMemo<AlertContextValue>(() => ({ alert, dismiss }), [alert, dismiss]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertToaster items={items} onDismiss={dismiss} />
    </AlertContext.Provider>
  );
}
