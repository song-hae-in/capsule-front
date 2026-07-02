import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type WizardStepShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function WizardStepShell({ title, description, children, className }: WizardStepShellProps) {
  return (
    <div className={cn('space-y-4 p-4 sm:p-6', className)}>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}

type WizardScaffoldCardProps = {
  title: string;
  items: string[];
};

export function WizardScaffoldCard({ title, items }: WizardScaffoldCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">Coming soon</Badge>
        </div>
        <CardDescription>Scaffold only — UI will be implemented in a later step.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
