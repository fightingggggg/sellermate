import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/components/Dashboard";
import PrivateRoute from "@/components/PrivateRoute";
import { QueryProvider } from "@/contexts/QueryContext";

export default function DashboardPage() {
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
