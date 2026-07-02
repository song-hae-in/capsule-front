import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Card({
  className,
  size = 'default',
  ...props
}: ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-card-foreground text-sm ring-1 ring-foreground/10',
        size === 'sm' && 'gap-3 py-3',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('px-4', className)} {...props} />;
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="card-title" className={cn('font-medium text-base leading-snug', className)} {...props} />
  );
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-4', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center border-t bg-muted/50 px-4 py-3', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
