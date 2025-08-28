'use client';

import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { SIDEBAR_MENU_ITEMS, APP_NAME } from '@/constants/app-constants';

interface SidebarProps {
  menuItems?: MenuItem[];
}

export function Sidebar({ menuItems = SIDEBAR_MENU_ITEMS }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 h-full border-r border-gray-700">
      <div className="p-4">
        <h2 className="text-xl font-bold text-blue-400 mb-6">
          {APP_NAME}
        </h2>
        <Menu 
          model={menuItems} 
          className="w-full bg-transparent border-none"
        />
      </div>
    </div>
  );
}