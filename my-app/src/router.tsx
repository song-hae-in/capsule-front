import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../features/layout/components/app-layout';
import { appRouteChildren } from './routes';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: appRouteChildren,
  },
]);
