'use client';

import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Box 
} from '@mui/material';
import { SIDEBAR_MENU_ITEMS, APP_NAME, type NavItem } from '@/constants/app-constants';
import Link from 'next/link';

interface SidebarProps {
  menuItems?: NavItem[];
  width?: number;
}

export function Sidebar({ menuItems = SIDEBAR_MENU_ITEMS, width = 280 }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h2" component="h1" sx={{ fontSize: '1.75rem' }}>
          {APP_NAME}
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.url}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '1.125rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}