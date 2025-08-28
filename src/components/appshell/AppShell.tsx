import { ReactNode } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}