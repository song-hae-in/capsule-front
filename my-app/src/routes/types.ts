import type { ReactNode } from 'react';

/** route + nav 공통 설정 한 항목 */
export type AppRouteConfig = {
  /** react-router path (예: '/', '/capsules') */
  path: string;
  /** nav 표시 라벨 */
  label: string;
  /** 페이지 컴포넌트 — external nav 전용이면 생략 */
  element?: ReactNode;
  /** nav에 표시 (기본 true, element 있는 route) */
  showInNav?: boolean;
  /** 외부 링크 — router children 제외, nav는 <a> */
  external?: boolean;
  /** action search 짧은 설명 */
  description?: string;
  /** hover-card 상세 설명 */
  navInfo?: string;
};

/** nav-links / action search에서 사용 */
export type NavItem = {
  label: string;
  to: string;
  external?: boolean;
  description?: string;
  navInfo?: string;
};
