import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  addDaysFromToday,
  buildUnlockAt,
  daysFromToday,
  formatUnlockDisplay,
  isUnlockInFuture,
  parseUnlockAt,
  startOfToday,
} from '../../lib/unlock-date';
import type { UnlockRule } from '../../types/create-capsule';
import { WizardStepShell } from './wizard-step-shell';

const MIN_DAYS = 0;
const MAX_DAYS = 365;
const MINUTE_STEP = 15;

function firstSliderValue(value: number | readonly number[]): number {
  if (typeof value === 'number') return value;
  return value[0] ?? 0;
}

type SetUnlockDateStepProps = {
  unlock: UnlockRule;
  onUnlockChange: (unlock: UnlockRule) => void;
  disabled?: boolean;
};

export default function SetUnlockDateStep({
  unlock,
  onUnlockChange,
  disabled = false,
}: SetUnlockDateStepProps) {
  const { date, hour, minute } = useMemo(() => parseUnlockAt(unlock.unlockAt), [unlock.unlockAt]);
  const days = daysFromToday(date);
  const isConfirmed = unlock.unlockConfirmed === true;
  const canConfirm = isUnlockInFuture(unlock.unlockAt) && !disabled;

  const updateUnlock = (nextDate: Date, nextHour: number, nextMinute: number) => {
    onUnlockChange({
      ...unlock,
      unlockAt: buildUnlockAt(nextDate, nextHour, nextMinute),
      unlockConfirmed: false,
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onUnlockChange({
      ...unlock,
      unlockConfirmed: true,
    });
  };

  return (
    <WizardStepShell
      title="Set Unlock Date"
      description="Choose when this capsule can be opened, then confirm to continue."
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Unlock date</CardTitle>
            {isConfirmed ? <Badge variant="outline">Confirmed</Badge> : null}
          </div>
          <CardDescription>Pick a day on the calendar or adjust with the slider.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Calendar
            disabled={disabled ? true : { before: startOfToday() }}
            mode="single"
            onSelect={(selected) => {
              if (!selected) return;
              updateUnlock(selected, hour, minute);
            }}
            selected={date}
          />

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Days from today</span>
              <span className="font-medium tabular-nums">{days} days</span>
            </div>
            <Slider
              disabled={disabled}
              max={MAX_DAYS}
              min={MIN_DAYS}
              step={1}
              value={[days]}
              onValueChange={(value) => {
                updateUnlock(addDaysFromToday(firstSliderValue(value)), hour, minute);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Unlock time</CardTitle>
          <CardDescription>Fine-tune the hour and minute on the selected day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hour</span>
              <span className="font-medium tabular-nums">{hour.toString().padStart(2, '0')}:00</span>
            </div>
            <Slider
              disabled={disabled}
              max={23}
              min={0}
              step={1}
              value={[hour]}
              onValueChange={(value) => {
                updateUnlock(date, firstSliderValue(value), minute);
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minute</span>
              <span className="font-medium tabular-nums">
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </span>
            </div>
            <Slider
              disabled={disabled}
              max={45}
              min={0}
              step={MINUTE_STEP}
              value={[minute]}
              onValueChange={(value) => {
                updateUnlock(date, hour, firstSliderValue(value));
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={isConfirmed ? 'border-primary/40 bg-primary/5' : undefined}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Confirm unlock schedule</CardTitle>
          <CardDescription>
            {isConfirmed
              ? 'Unlock date is locked in. Change date or time above to edit again.'
              : 'Review the schedule below and confirm before moving on.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Opens on </span>
            <span className="font-medium">{formatUnlockDisplay(unlock.unlockAt)}</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            className="w-full gap-1.5"
            disabled={!canConfirm || isConfirmed}
            onClick={handleConfirm}
          >
            <CheckCircle2 className="size-4" />
            {isConfirmed ? 'Unlock date confirmed' : 'Confirm unlock date'}
          </Button>
        </CardFooter>
      </Card>

      {/* <p className="text-muted-foreground text-xs">
        Visibility, encryption, wallet allowlist, and secret code are optional — not in this MVP.
      </p> */}
    </WizardStepShell>
  );
}
