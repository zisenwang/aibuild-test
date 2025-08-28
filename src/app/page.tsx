import { AppShell } from "@/components/appshell/AppShell";
import { StatCard } from "@/components/cards/StatCard";
import { Typography, Box, Grid } from "@mui/material";
import { TrendingUp, Dashboard, Analytics } from "@/lib/icons";

export default function Home() {
  return (
    <AppShell>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Retail Insights Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Total Revenue"
            value="$125,430"
            icon={TrendingUp}
            color="primary"
            subtitle="This month"
            trend={{ value: 12.5, isPositive: true }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Products Sold"
            value="1,245"
            icon={Dashboard}
            color="secondary"
            subtitle="Units sold"
            trend={{ value: -2.1, isPositive: false }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <StatCard
            title="Customer Satisfaction"
            value="89%"
            icon={Analytics}
            color="success"
            subtitle="Average rating"
            trend={{ value: 5.3, isPositive: true }}
          />
        </Grid>
      </Grid>
    </AppShell>
  );
}
