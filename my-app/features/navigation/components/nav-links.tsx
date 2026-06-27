import { Link, useLocation } from 'react-router-dom';
import { getNavItems } from '../../../src/routes';

type NavLinksProps = {
  className?: string;
  /** 링크 클릭 시 추가 콜백 (모바일 메뉴 닫기 등) */
  onNavigate?: () => void;
};

/**
 * 상단 navigation 링크 목록.
 *
 * TODO: active 링크 스타일 고도화
 * TODO: 모바일 드로어/햄버거 메뉴와 연동
 * TODO: route-config metadata 기반 auth/권한별 필터링
 */
export default function NavLinks({ className = '', onNavigate }: NavLinksProps) {
  const { pathname } = useLocation();
  const navItems = getNavItems();

  return (
    <nav className={className} aria-label="Main navigation">
      <ul className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.to;

          return (
            <li key={item.to}>
              {item.external ? (
                <a
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={onNavigate}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.to}
                  className={`rounded-full px-3 py-2 text-sm transition-colors hover:text-foreground ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
