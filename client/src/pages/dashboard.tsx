import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/components/Dashboard";
import PrivateRoute from "@/components/PrivateRoute";
import { QueryProvider } from "@/contexts/QueryContext";

import { useEffect } from "react";
import { trackTimeSpent } from "@/lib/analytics";

export default function DashboardPage() {
  useEffect(() => {
    const cleanup = trackTimeSpent('Dashboard Page');
    return cleanup;
  }, []);
  return (
    <PrivateRoute>
      <QueryProvider>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </QueryProvider>
    </PrivateRoute>
  );
}
