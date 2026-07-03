import { Home, List, PlusCircle, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ActionSearchBar, { type NavAction } from '@/components/kokonutui/action-search-bar';
import { useWallet } from '@/hooks/use-wallet';
import { CREATE_CAPSULE_PATH, getNavItems } from '../../../src/routes';

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  Create: PlusCircle,
  List: List,
};

type NavActionSearchProps = {
  className?: string;
  onNavigate?: () => void;
};

/**
 * 현재 페이지 이름 표시 + 클릭 시 Create / List 선택.
 */
export default function NavActionSearch({ className = '', onNavigate }: NavActionSearchProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isConnected } = useWallet();
  const navItems = getNavItems();

  const actions = useMemo<NavAction[]>(
    () =>
      navItems.map((item) => {
        const Icon = NAV_ICON_MAP[item.label] ?? List;
        return {
          id: item.to,
          label: item.label,
          icon: <Icon className="h-4 w-4 text-primary" />,
          description: item.description,
          href: item.to,
          navInfo: item.navInfo,
        };
      }),
    [navItems],
  );

  const currentAction = useMemo(
    () => actions.find((action) => action.href === pathname),
    [actions, pathname],
  );

  const triggerLabel = currentAction?.label ?? (pathname === '/' ? 'Home' : 'Pages');
  const TriggerIcon = currentAction
    ? NAV_ICON_MAP[currentAction.label] ?? List
    : Home;

  const handleSelect = (action: NavAction) => {
    if (!action.href) return;

    // 라우트 이동 후 RequireWallet이 되돌리면 현재 페이지가 재마운트되므로
    // (랜딩 3D 재로딩 등) 이동 자체를 여기서 차단한다.
    if (action.href === CREATE_CAPSULE_PATH && !isConnected) {
      toast.error('Connect your wallet to create a capsule', { id: 'require-wallet' });
      return;
    }

    navigate(action.href);
    onNavigate?.();
  };

  return (
    <ActionSearchBar
      actions={actions}
      variant="compact"
      triggerLabel={triggerLabel}
      triggerIcon={<TriggerIcon className="h-4 w-4 text-primary" />}
      className={className}
      onSelect={handleSelect}
    />
  );
}
