import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Sidebar } from '../sidebar/Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = 280;

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar width={SIDEBAR_WIDTH} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="xl" sx={{ p: 0 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}