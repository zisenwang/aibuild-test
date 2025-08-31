import { Dashboard, Upload, Settings, Logout } from '@/lib/icons';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
} as const;

export interface NavItem {
  label: string;
  icon: React.ComponentType;
  url: string;
}

export const SIDEBAR_MENU_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Dashboard,
    url: ROUTES.DASHBOARD
  },
  {
    label: 'Upload Data', 
    icon: Upload,
    url: ROUTES.UPLOAD
  }
];

export interface TopbarMenuItem {
  label: string;
  icon: React.ComponentType;
  action?: () => void;
}

export const TOPBAR_MENU_ITEMS: TopbarMenuItem[] = [
  {
    label: 'Settings',
    icon: Settings
  },
  {
    label: 'Logout', 
    icon: Logout
  }
];

export const APP_NAME = 'AIBUILD';

