import { MenuItem } from 'primereact/menuitem';

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-line',
    url: '/'
  },
  {
    label: 'Upload Data',
    icon: 'pi pi-upload',
    url: '/upload'
  },
  {
    label: 'Analytics',
    icon: 'pi pi-chart-bar',
    url: '/analytics'
  }
];

export const TOPBAR_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    items: [
      {
        label: 'Settings',
        icon: 'pi pi-cog'
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out'
      }
    ]
  }
];

export const APP_NAME = 'Retail Insights';