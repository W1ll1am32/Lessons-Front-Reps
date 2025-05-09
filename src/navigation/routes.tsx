import type { ComponentType, JSX } from 'react';

// import { IndexPage } from '@/pages/IndexPage/IndexPage.tsx';
import { StartPage } from '@/pages/StartPage/StartPage.tsx';
import { MyOrdersPage } from "@/pages/MyOrders.tsx";
import { OrderDetailsPage } from "@/pages/MyOrdersDetails";
import { ProfilePage } from "@/pages/Profile.tsx";
import { ResponsesPage } from "@/pages/MyResponses.tsx";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
  protected?: boolean;
}

export const routes: Route[] = [
  { path: '/', Component: StartPage},
  { path: '/orders', Component: MyOrdersPage},
  { path: '/order/:id', Component: OrderDetailsPage },
  { path: '/profile', Component: ProfilePage },
  { path: '/responses', Component: ResponsesPage },
  { path: '/response/:id', Component: OrderDetailsPage },
];
