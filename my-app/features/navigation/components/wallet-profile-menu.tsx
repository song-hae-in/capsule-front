import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Copy, ExternalLink, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '../../../src/hooks/use-wallet';
import {
  formatWalletAddress,
  getExplorerUrl,
  getWalletAvatarUrl,
  getWalletStatusLabel,
} from '../utils/wallet-display';

type WalletProfileMenuProps = {
  className?: string;
};

function StatusDot({ status }: { status: 'connected' | 'connecting' | 'error' }) {
  const colorClass =
    status === 'error'
      ? 'bg-red-500'
      : status === 'connecting'
        ? 'bg-amber-500 animate-pulse'
        : 'bg-emerald-500';

  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colorClass}`} aria-hidden />;
}

/**
 * 연결됨 — Connect 버튼과 동일한 h-9, 원형 프로필 + 옆에 연결 상태.
 */
export default function WalletProfileMenu({ className = '' }: WalletProfileMenuProps) {
  const { wallet, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const address = wallet.address;
  if (!address) return null;

  const avatarUrl = getWalletAvatarUrl(address);
  const statusLabel = getWalletStatusLabel(wallet.status, wallet.chainName);
  const dotStatus =
    wallet.status === 'error'
      ? 'error'
      : wallet.status === 'connecting'
        ? 'connecting'
        : 'connected';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={`flex h-9 shrink-0 items-center gap-2 rounded-full border border-border pl-1 pr-3 transition-colors hover:border-primary/50 hover:ring-2 hover:ring-primary/20 focus:outline-none ${className}`}
          aria-label={`Wallet menu — ${statusLabel}`}
        >
          <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <StatusDot status={dotStatus} />
            <span className="max-w-[5.5rem] truncate">{statusLabel}</span>
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[80] min-w-[12rem] rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Wallet</p>
            <p className="text-sm font-medium text-foreground">{formatWalletAddress(address)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <StatusDot status={dotStatus} />
              {statusLabel}
            </p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none hover:bg-accent"
            onSelect={handleCopy}
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy address'}
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <a
              href={getExplorerUrl(address)}
              target="_blank"
              rel="noreferrer"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 outline-none hover:bg-red-500/10"
            onSelect={() => disconnect()}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
