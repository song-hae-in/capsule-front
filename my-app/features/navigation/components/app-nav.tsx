import { Link } from 'react-router-dom';
import NavActionSearch from './nav-action-search';
import WalletConnectButton from './wallet-connect-button';

type AppNavProps = {
  className?: string;
};

/**
 * 앱 상단 navigation bar.
 *
 * TODO: Capsule 로고 SVG/이미지로 교체
 * TODO: sticky / scroll 시 배경 blur 처리
 * TODO: 모바일 — 햄버거 + 드로어 (NavLinks, WalletConnectButton 포함)
 */
export default function AppNav({ className = '' }: AppNavProps) {
  return (
    <header
      className={`fixed top-0 right-0 left-0 z-[70] border-b border-border/50 bg-background/80 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-foreground"
        >
          Capsule
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <NavActionSearch className="w-36" />
          <WalletConnectButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NavActionSearch className="w-32" />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
