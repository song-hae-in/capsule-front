import { Outlet } from 'react-router-dom';
import AppNav from '../../navigation/components/app-nav';

/**
 * 앱 공통 shell — header(nav) + main(Outlet).
 * navigation / footer 등 feature 컴포넌트를 조합하는 레이어.
 *
 * : footer 추가
 * : sidebar 레이아웃 variant
 */
export default function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <AppNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
