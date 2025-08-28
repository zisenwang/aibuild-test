'use client';

import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { TOPBAR_MENU_ITEMS } from '@/constants/app-constants';

export function Topbar() {
  const end = (
    <div className="flex items-center gap-2">
      <Button 
        icon="pi pi-bell" 
        text 
        className="text-gray-300 hover:text-blue-400"
        aria-label="Notifications"
      />
      <Button 
        icon="pi pi-user" 
        text 
        className="text-gray-300 hover:text-blue-400"
        aria-label="User menu"
      />
    </div>
  );

  return (
    <div className="border-b border-gray-700 bg-gray-800">
      <Menubar 
        model={TOPBAR_MENU_ITEMS} 
        end={end}
        className="bg-transparent border-none px-6 py-3"
      />
    </div>
  );
}