import { Loader2, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import {
  CAPSULE_DESIGN_LABELS,
  type BufferIpfsStatus,
  type BufferOnchainStatus,
  type CapsuleBuffer,
  type CapsuleDesignId,
  type UnlockRule,
} from '../../types/create-capsule';
import { formatFileSize, type MemoryFile } from '../../types/memory-upload';
import { MemoryCardStack } from '../memory-card';

const IPFS_STATUS_LABEL: Record<BufferIpfsStatus, string> = {
  idle: 'Not started',
  uploading: 'Uploading metadata',
  ready: 'IPFS Ready',
  failed: 'Metadata failed',
};

const ONCHAIN_STATUS_LABEL: Record<BufferOnchainStatus, string> = {
  idle: 'Not started',
  awaiting_signature: 'Awaiting signature',
  submitting: 'Submitting',
  failed: 'Record failed',
  confirmed: 'Sealed',
};

function bufferBadgeVariant(
  status: BufferIpfsStatus | BufferOnchainStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'ready' || status === 'confirmed') return 'outline';
  if (status === 'failed') return 'destructive';
  if (status === 'idle') return 'secondary';
  return 'default';
}

type ReviewRowProps = {
  label: string;
  value: string;
};

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function formatUnlockSummary(unlock: UnlockRule): string {
  const parts = [
    unlock.visibility === 'public' ? 'Public' : 'Private',
    unlock.encrypted ? 'Encrypted' : 'Not encrypted',
  ];
  if (unlock.unlockAt) parts.push(`Unlocks ${new Date(unlock.unlockAt).toLocaleString()}`);
  return parts.join(' · ');
}

type ReviewSealStepProps = {
  files: MemoryFile[];
  buffer: CapsuleBuffer;
  design: CapsuleDesignId;
  unlock: UnlockRule;
  totalBytes: number;
  isSealing: boolean;
  onSeal: () => void;
  onRetryBlockchain: () => void;
  onRetryMetadata: () => void;
  onRetryFile: (id: string) => void;
  embedded?: boolean;
  className?: string;
};

export default function ReviewSealStep({
  files,
  buffer,
  design,
  unlock,
  totalBytes,
  isSealing,
  onSeal,
  onRetryBlockchain,
  onRetryMetadata,
  onRetryFile,
  embedded = false,
  className,
}: ReviewSealStepProps) {
  const { isConnected } = useWallet();

  const isSealed = buffer.onchain.status === 'confirmed';
  const showBlockchainRetry =
    buffer.ipfs.status === 'ready' && buffer.onchain.status === 'failed' && !isSealing;
  const showMetadataRetry = buffer.ipfs.status === 'failed' && !isSealing;
  const showSealProgress = files.some((item) => item.seal.status !== 'ready_to_seal');
  const canSeal = files.length > 0 && isConnected && !isSealing && !isSealed;

  return (
    <section className={cn('space-y-4', embedded && 'p-4 sm:p-6', className)}>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {embedded ? 'Review & Seal Capsule' : 'Review & Seal'}
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Confirm your capsule, then encrypt, upload to IPFS, and record on-chain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Everything that will be sealed into this capsule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReviewRow label="Memories" value={`${files.length} file${files.length === 1 ? '' : 's'}`} />
          <ReviewRow label="Total size" value={formatFileSize(totalBytes)} />
          <ReviewRow label="Design" value={CAPSULE_DESIGN_LABELS[design]} />
          <ReviewRow label="Seal rules" value={formatUnlockSummary(unlock)} />
          <ReviewRow label="Storage" value="IPFS" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seal status</CardTitle>
          <CardDescription>IPFS metadata and on-chain record are tracked separately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={bufferBadgeVariant(buffer.ipfs.status)}>
              Metadata: {IPFS_STATUS_LABEL[buffer.ipfs.status]}
            </Badge>
            <Badge variant={bufferBadgeVariant(buffer.onchain.status)}>
              On-chain: {ONCHAIN_STATUS_LABEL[buffer.onchain.status]}
            </Badge>
          </div>

          {buffer.ipfs.metadataCid ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">metadataCid</p>
              <p className="truncate font-mono text-xs">{buffer.ipfs.metadataCid}</p>
            </div>
          ) : null}

          {buffer.onchain.txHash ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Transaction</p>
              <p className="truncate font-mono text-xs">{buffer.onchain.txHash}</p>
            </div>
          ) : null}

          {buffer.ipfs.error ? (
            <p className="text-destructive text-xs">{buffer.ipfs.error}</p>
          ) : null}
          {buffer.onchain.error ? (
            <p className="text-destructive text-xs">{buffer.onchain.error}</p>
          ) : null}

          {!isConnected ? (
            <p className="text-muted-foreground text-xs">Connect your wallet to seal this capsule.</p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={onSeal} disabled={!canSeal} className="gap-1.5">
            {isSealing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sealing…
              </>
            ) : isSealed ? (
              <>
                <ShieldCheck className="size-4" />
                Sealed
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Seal Capsule
              </>
            )}
          </Button>

          {showBlockchainRetry ? (
            <Button variant="outline" onClick={onRetryBlockchain} className="gap-1.5">
              <RefreshCw className="size-4" />
              Retry blockchain record
            </Button>
          ) : null}

          {showMetadataRetry ? (
            <Button variant="outline" onClick={onRetryMetadata} className="gap-1.5">
              <RefreshCw className="size-4" />
              Retry metadata pin
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      {showSealProgress ? (
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Upload progress</h3>
          <MemoryCardStack files={files} onRetry={onRetryFile} />
        </div>
      ) : null}
    </section>
  );
}
