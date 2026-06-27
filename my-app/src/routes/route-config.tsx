import type { RouteObject } from 'react-router-dom';
import CreateCapsulePage from '../../features/capsules/pages/create-capsule-page';
import ListCapsulePage from '../../features/capsules/pages/list-capsule-page';
import LandingPage from '../../features/landing/pages/landing-page';
import type { AppRouteConfig, NavItem } from './types';

/**
 * 앱 route + nav 단일 설정.
 * 새 페이지: 여기 항목 하나 추가 → router·nav 자동 반영.
 */
export const APP_ROUTES: AppRouteConfig[] = [
  {
    path: '/',
    label: 'Home',
    element: <LandingPage />,
    showInNav: false,
  },
  {
    path: '/capsules/create',
    label: 'Create',
    description: 'New capsule',
    navInfo: '메시지와 공개 시각을 설정해 타임캡슐을 생성합니다.',
    element: <CreateCapsulePage />,
    showInNav: true,
  },
  {
    path: '/capsules',
    label: 'List',
    description: 'My capsules',
    navInfo: '만든 캡슐과 상태(잠김 / 열림)를 확인합니다.',
    element: <ListCapsulePage />,
    showInNav: true,
  },
];

/** router children — element 있는 내부 route만 */
export const appRouteChildren: RouteObject[] = APP_ROUTES.filter(
  (route) => route.element && !route.external,
).map(({ path, element }) => ({
  path,
  element,
}));

/** nav 링크 — showInNav !== false && label 있는 항목 */
export function getNavItems(): NavItem[] {
  return APP_ROUTES.filter((route) => route.showInNav !== false && route.label).map(
    ({ path, label, external, description, navInfo }) => ({
      label,
      to: path,
      external,
      description,
      navInfo,
    }),
  );
}
