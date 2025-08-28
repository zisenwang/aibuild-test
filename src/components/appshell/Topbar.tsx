'use client';

import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Box
} from '@mui/material';
import { useState } from 'react';
import { TOPBAR_MENU_ITEMS } from '@/constants/app-constants';
import { Notifications, AccountCircle } from '@/lib/icons';

export function Topbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="notifications"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <Notifications />
          </IconButton>
          
          <IconButton
            color="inherit"
            aria-label="user menu"
            onClick={handleMenuOpen}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }
            }}
          >
            {TOPBAR_MENU_ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <MenuItem 
                  key={item.label} 
                  onClick={() => {
                    handleMenuClose();
                    item.action?.();
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.secondary' }}>
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              );
            })}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}