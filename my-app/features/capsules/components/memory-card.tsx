import { FileText, ImageIcon, Loader2, Paperclip, RefreshCw, Trash2 } from 'lucide-react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Badge } from '@/components/ui/badge';
import { Progress, ProgressValue } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  isLocalBufferStatus,
  isSealLockedStatus,
  type MemoryFile,
  type MemoryFileStatus,
} from '../types/memory-upload';

const STATUS_LABEL: Record<MemoryFileStatus, string> = {
  ready_to_seal: 'Ready to seal',
  checking: 'Checking',
  invalid: 'Invalid',
  encrypting: 'Encrypting',
  hashing: 'Hashing',
  uploading: 'Uploading',
  ipfs_ready: 'IPFS Ready',
  sealed: 'Sealed',
  failed: 'Failed',
};

function statusBadgeVariant(
  status: MemoryFileStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ready_to_seal':
      return 'secondary';
    case 'checking':
    case 'encrypting':
    case 'hashing':
      return 'default';
    case 'uploading':
      return 'default';
    case 'ipfs_ready':
    case 'sealed':
      return 'outline';
    case 'invalid':
    case 'failed':
      return 'destructive';
  }
}

function toAttachmentState(
  status: MemoryFileStatus,
): 'idle' | 'uploading' | 'processing' | 'error' | 'done' {
  switch (status) {
    case 'ready_to_seal':
      return 'idle';
    case 'checking':
    case 'encrypting':
    case 'hashing':
      return 'processing';
    case 'uploading':
      return 'uploading';
    case 'ipfs_ready':
    case 'sealed':
      return 'done';
    case 'invalid':
    case 'failed':
      return 'error';
  }
}

function isProcessingStatus(status: MemoryFileStatus): boolean {
  return (
    status === 'checking' ||
    status === 'encrypting' ||
    status === 'hashing' ||
    status === 'uploading'
  );
}

function CategoryIcon({ category }: { category: MemoryFile['category'] }) {
  if (category === 'photo') return <ImageIcon className="size-4" />;
  if (category === 'document') return <FileText className="size-4" />;
  return <Paperclip className="size-4" />;
}

type MemoryCardProps = {
  file: MemoryFile;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
};

export default function MemoryCard({ file, onRemove, onRetry }: MemoryCardProps) {
  const { seal } = file;
  const isProcessing = isProcessingStatus(seal.status);
  const isRemovable = Boolean(onRemove) && !isSealLockedStatus(seal.status) && seal.status !== 'uploading';
  const showIpfsProgress = seal.status === 'uploading';

  return (
    <div className="space-y-2">
      <Attachment
        state={toAttachmentState(seal.status)}
        className="w-full max-w-none min-w-0 items-start"
      >
        <AttachmentMedia variant={file.previewUrl ? 'image' : 'icon'} className="h-12 w-12">
          {file.previewUrl ? (
            <img src={file.previewUrl} alt="" />
          ) : isProcessing ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <CategoryIcon category={file.category} />
          )}
        </AttachmentMedia>

        <AttachmentContent className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <AttachmentTitle>{file.file.name}</AttachmentTitle>
            <Badge variant={statusBadgeVariant(seal.status)} className="shrink-0">
              {STATUS_LABEL[seal.status]}
            </Badge>
          </div>

          <AttachmentDescription>
            {formatFileSize(file.file.size)} · {file.category}
            {isLocalBufferStatus(seal.status) ? ' · local buffer' : null}
          </AttachmentDescription>

          {seal.cid ? (
            <p className="truncate font-mono text-[10px] text-muted-foreground">{seal.cid}</p>
          ) : null}

          {seal.error ? <p className="text-destructive text-xs">{seal.error}</p> : null}

          {showIpfsProgress ? (
            <Progress value={seal.progress} className="w-full pt-1">
              <ProgressValue />
            </Progress>
          ) : null}
        </AttachmentContent>

        <AttachmentActions>
          {seal.status === 'failed' && onRetry ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <AttachmentAction
                    type="button"
                    aria-label="Retry IPFS upload"
                    onClick={() => onRetry(file.id)}
                  />
                }
              >
                <RefreshCw className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Retry IPFS upload</TooltipContent>
            </Tooltip>
          ) : null}

          {onRemove ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <AttachmentAction
                    type="button"
                    aria-label={`Remove ${file.file.name}`}
                    disabled={!isRemovable}
                    onClick={() => onRemove(file.id)}
                  />
                }
              >
                <Trash2 className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>
                {isRemovable ? 'Remove file' : 'Cannot remove while sealing'}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

type MemoryCardStackProps = {
  files: MemoryFile[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
};

const SCROLL_FADE_THRESHOLD = 4;

export function MemoryCardStack({ files, onRemove, onRetry, className }: MemoryCardStackProps) {
  if (files.length === 0) return null;

  const items = files.map((file) => (
    <li key={file.id}>
      <MemoryCard file={file} onRemove={onRemove} onRetry={onRetry} />
    </li>
  ));

  if (files.length < SCROLL_FADE_THRESHOLD) {
    return <ul className={cn('space-y-3', className)}>{items}</ul>;
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border', className)}>
      <div className="max-h-80 scroll-fade scrollbar-none overflow-y-auto">
        <ul className="flex flex-col gap-3 p-1.5">{items}</ul>
      </div>
    </div>
  );
}
