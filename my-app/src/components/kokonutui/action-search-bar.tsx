'use client';

import { ChevronDown, Search, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export type NavAction = {
  id: string;
  label: string;
  icon: ReactNode;
  description?: string;
  short?: string;
  end?: string;
  href?: string;
  navInfo?: string;
};

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: { duration: 0.3 },
        staggerChildren: 0.06,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.15 },
    },
  },
} as const;

type ActionSearchBarProps = {
  actions: NavAction[];
  defaultOpen?: boolean;
  variant?: 'default' | 'compact';
  /** compact — 트리거에 표시할 현재 페이지 이름 */
  triggerLabel?: string;
  /** compact — 트리거 아이콘 */
  triggerIcon?: ReactNode;
  placeholder?: string;
  className?: string;
  onSelect?: (action: NavAction) => void;
};

function ActionRowContent({
  action,
  variant,
}: {
  action: NavAction;
  variant: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <>
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-muted-foreground">
          {action.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm leading-snug">{action.label}</p>
          {action.description ? (
            <p className="mt-0.5 text-muted-foreground text-xs leading-snug">{action.description}</p>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span aria-hidden="true" className="shrink-0 text-muted-foreground">
          {action.icon}
        </span>
        <span className="font-medium text-sm">{action.label}</span>
        {action.description ? (
          <span className="text-muted-foreground text-xs">{action.description}</span>
        ) : null}
      </div>
      {action.end ? (
        <span className="ml-2 shrink-0 text-muted-foreground text-xs">{action.end}</span>
      ) : null}
    </>
  );
}

function ActionRow({
  action,
  isActive,
  onSelect,
  variant,
}: {
  action: NavAction;
  isActive: boolean;
  onSelect: (action: NavAction) => void;
  variant: 'default' | 'compact';
}) {
  const buttonClassName = cn(
    'flex w-full cursor-pointer rounded-md px-3 py-2.5 text-left transition-colors',
    variant === 'compact' ? 'items-start gap-2.5' : 'items-center justify-between',
    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70',
  );

  const row = (
    <button
      type="button"
      className={buttonClassName}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(action)}
    >
      <ActionRowContent action={action} variant={variant} />
    </button>
  );

  if (!action.navInfo) return row;

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={200}
        closeDelay={80}
        render={
          <button
            type="button"
            className={buttonClassName}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(action)}
          />
        }
      >
        <ActionRowContent action={action} variant={variant} />
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-56">
        <p className="font-medium">{action.label}</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{action.navInfo}</p>
        {action.href ? (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">{action.href}</p>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

function CompactPagePicker({
  actions,
  triggerLabel,
  triggerIcon,
  className,
  onSelect,
  defaultOpen = false,
}: {
  actions: NavAction[];
  triggerLabel: string;
  triggerIcon?: ReactNode;
  className?: string;
  onSelect?: (action: NavAction) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (action: NavAction) => {
      onSelect?.(action);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setActiveIndex(0);
          } else {
            setActiveIndex((prev) => (prev < actions.length - 1 ? prev + 1 : 0));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setActiveIndex(actions.length - 1);
          } else {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : actions.length - 1));
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && activeIndex >= 0 && actions[activeIndex]) {
            handleSelect(actions[activeIndex]);
          } else {
            setIsOpen(true);
            setActiveIndex(0);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [actions, activeIndex, handleSelect, isOpen],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-9 w-full items-center gap-2 rounded-full border border-border bg-background/60 px-3 text-sm transition-colors hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={() => {
          setIsOpen((open) => !open);
          setActiveIndex(-1);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {triggerIcon ? (
          <span aria-hidden="true" className="shrink-0">
            {triggerIcon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left font-medium">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate="show"
            aria-label="Page navigation"
            className="absolute top-full left-0 z-[80] mt-1 w-max min-w-full max-w-[16rem] overflow-hidden rounded-xl border border-border bg-popover shadow-lg sm:max-w-[18rem]"
            exit="exit"
            initial="hidden"
            role="listbox"
            variants={ANIMATION_VARIANTS.container}
          >
            <motion.ul className="p-1" role="none">
              {actions.map((action, index) => (
                <motion.li
                  key={action.id}
                  aria-selected={activeIndex === index}
                  id={`action-${action.id}`}
                  layout
                  role="option"
                  variants={ANIMATION_VARIANTS.item}
                >
                  <ActionRow
                    action={action}
                    isActive={activeIndex === index}
                    onSelect={handleSelect}
                    variant="compact"
                  />
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ActionSearchBar({
  actions,
  defaultOpen = false,
  variant = 'default',
  triggerLabel = 'Pages',
  triggerIcon,
  placeholder = 'Search pages…',
  className,
  onSelect,
}: ActionSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);

  const filteredActions = useMemo(() => {
    if (!debouncedQuery) return actions;

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    return actions.filter((action) => {
      const searchableText =
        `${action.label} ${action.description ?? ''} ${action.navInfo ?? ''}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [actions, debouncedQuery]);

  useEffect(() => {
    if (variant === 'compact') return;
    if (!isFocused) {
      setActiveIndex(-1);
    }
  }, [isFocused, variant]);

  const handleSelect = useCallback(
    (action: NavAction) => {
      onSelect?.(action);
      setQuery('');
      setIsFocused(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredActions.length) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev) => (prev < filteredActions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredActions.length - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (activeIndex >= 0 && filteredActions[activeIndex]) {
            handleSelect(filteredActions[activeIndex]);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setActiveIndex(-1);
          break;
      }
    },
    [activeIndex, filteredActions, handleSelect],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setActiveIndex(-1);
  }, []);

  const handleBlur = useCallback(() => {
    window.setTimeout(() => {
      setIsFocused(false);
      setActiveIndex(-1);
    }, 200);
  }, []);

  if (variant === 'compact') {
    return (
      <CompactPagePicker
        actions={actions}
        triggerLabel={triggerLabel}
        triggerIcon={triggerIcon}
        className={className}
        onSelect={onSelect}
        defaultOpen={defaultOpen}
      />
    );
  }

  return (
    <div className={cn('relative mx-auto w-full max-w-xl', className)}>
      <div className="relative flex min-h-[300px] flex-col items-center justify-start">
        <div className="sticky top-0 z-10 w-full max-w-sm bg-background pt-4 pb-1">
          <label
            className="mb-1 block font-medium text-muted-foreground text-xs"
            htmlFor="action-search"
          >
            Search Commands
          </label>
          <div className="relative">
            <Input
              aria-activedescendant={
                activeIndex >= 0 ? `action-${filteredActions[activeIndex]?.id}` : undefined
              }
              aria-autocomplete="list"
              aria-expanded={isFocused}
              autoComplete="off"
              className="h-9 rounded-lg py-1.5 pr-9 pl-3 text-sm focus-visible:ring-offset-0"
              id="action-search"
              onBlur={handleBlur}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role="combobox"
              type="text"
              value={query}
            />
            <div className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  <motion.div
                    key="send"
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 12, opacity: 0 }}
                    initial={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 12, opacity: 0 }}
                    initial={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence>
            {isFocused ? (
              <motion.div
                animate="show"
                aria-label="Search results"
                className="relative mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                exit="exit"
                initial="hidden"
                role="listbox"
                variants={ANIMATION_VARIANTS.container}
              >
                <motion.ul className="p-1" role="none">
                  {filteredActions.length > 0 ? (
                    filteredActions.map((action, index) => (
                      <motion.li
                        key={action.id}
                        aria-selected={activeIndex === index}
                        id={`action-${action.id}`}
                        layout
                        role="option"
                        variants={ANIMATION_VARIANTS.item}
                      >
                        <ActionRow
                          action={action}
                          isActive={activeIndex === index}
                          onSelect={handleSelect}
                          variant="default"
                        />
                      </motion.li>
                    ))
                  ) : (
                    <li className="px-3 py-4 text-center text-muted-foreground text-sm">
                      No pages found
                    </li>
                  )}
                </motion.ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
