import { Dashboard, Upload, Analytics, Settings, Logout } from '@/lib/icons';

export interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  url: string;
}

export const SIDEBAR_MENU_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Dashboard,
    url: '/'
  },
  {
    label: 'Upload Data', 
    icon: Upload,
    url: '/upload'
  },
  {
    label: 'Analytics',
    icon: Analytics,
    url: '/analytics'
  }
];

export interface TopbarMenuItem {
  label: string;
  icon: React.ComponentType<any>;
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

export const APP_NAME = 'Retail Insights';