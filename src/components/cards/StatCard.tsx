'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon: IconComponent,
  color = 'primary',
  subtitle,
  trend
}: StatCardProps) {
  const getColorByType = (colorType: string) => {
    switch (colorType) {
      case 'primary': return 'primary.main';
      case 'secondary': return 'secondary.main';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return 'primary.main';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {IconComponent && (
            <Avatar
              sx={{
                backgroundColor: getColorByType(color),
                color: 'white',
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              <IconComponent />
            </Avatar>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
        </Box>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: trend.isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}