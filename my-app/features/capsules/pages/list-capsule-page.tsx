import { Link } from 'react-router-dom';
import { FlaskConical, Lock, LockOpen, PackageOpen, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CREATE_CAPSULE_PATH } from '@/routes';
import { useWallet } from '@/hooks/use-wallet';
import { useMyCapsules } from '../hooks/use-my-capsules';
import { formatUnlockDisplay } from '../lib/unlock-date';
import {
  CAPSULE_STATE_LABELS,
  getCapsuleState,
  type CapsuleState,
  type CapsuleSummary,
} from '../types/capsule-summary';
import { CAPSULE_DESIGN_LABELS } from '../types/create-capsule';

const STATE_ICONS: Record<CapsuleState, typeof Lock> = {
  locked: Lock,
  unlockable: LockOpen,
  opened: PackageOpen,
};

const STATE_BADGE_CLASSES: Record<CapsuleState, string> = {
  locked: 'border-border text-muted-foreground',
  unlockable: 'border-primary/40 bg-primary/10 text-primary',
  opened: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

function truncateMiddle(value: string, head = 10, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function CapsuleCard({ capsule }: { capsule: CapsuleSummary }) {
  const state = getCapsuleState(capsule);
  const StateIcon = STATE_ICONS[state];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {capsule.design ? CAPSULE_DESIGN_LABELS[capsule.design] : 'Capsule'}
          </CardTitle>
          <Badge className={`gap-1 ${STATE_BADGE_CLASSES[state]}`} variant="outline">
            <StateIcon className="size-3" />
            {CAPSULE_STATE_LABELS[state]}
          </Badge>
        </div>
        <CardDescription>
          {state === 'opened' ? 'Opened' : 'Opens'} · {formatUnlockDisplay(capsule.unlockAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm">
        {typeof capsule.fileCount === 'number' ? (
          <p className="text-muted-foreground">
            {capsule.fileCount} {capsule.fileCount === 1 ? 'memory' : 'memories'}
          </p>
        ) : null}
        <p className="font-mono text-xs text-muted-foreground" title={capsule.metadataCid}>
          CID {truncateMiddle(capsule.metadataCid)}
        </p>
        {capsule.txHash ? (
          <p className="font-mono text-xs text-muted-foreground" title={capsule.txHash}>
            TX {truncateMiddle(capsule.txHash)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function ListCapsulePage() {
  const { isConnected, connect, isConnecting } = useWallet();
  const { capsules, isLoading, isError, refetch, source } = useMyCapsules();

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">My Capsules</h1>
          <p className="mt-3 text-muted-foreground">
            만든 캡슐 목록과 상태를 확인하는 페이지입니다.
          </p>
        </div>
        {isConnected ? (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={refetch}>
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        ) : null}
      </div>

      {source === 'local' && isConnected ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FlaskConical className="size-3.5" />
          컨트랙트 배포 전 mock 모드 — 이 브라우저(localStorage)에 저장된 캡슐만 표시됩니다.
        </p>
      ) : null}

      {!isConnected ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">
              지갑을 연결하면 내 캡슐 목록을 볼 수 있습니다.
            </p>
            <Button disabled={isConnecting} onClick={() => void connect()}>
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading capsules…</p>
      ) : isError ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">온체인 조회에 실패했습니다.</p>
            <Button variant="outline" onClick={refetch}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : capsules.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">아직 만든 캡슐이 없습니다.</p>
            <Link className={`${buttonVariants()} gap-1.5`} to={CREATE_CAPSULE_PATH}>
              <Plus className="size-4" />
              Start your Capsule
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {capsules.map((capsule) => (
            <CapsuleCard capsule={capsule} key={capsule.id} />
          ))}
        </div>
      )}
    </div>
  );
}
