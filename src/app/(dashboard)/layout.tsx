import { ReactNode } from 'react';
import { AppShell } from '@/components/appshell/AppShell';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AppShell>{children}</AppShell>;
}