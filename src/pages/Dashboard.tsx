import YearlyRevenueSummary from "@/components/YearlyRevenueSummary";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Admin sees Revenue Analytics dashboard
  if (isAdmin) {
    return (
      <div className="p-6 space-y-8">
        <YearlyRevenueSummary />
        <div className="border-t border-border" />
        <div className="space-y-6" />
      </div>
    );
  }

  // Regular users and managers see personalized dashboard
  return <UserDashboard />;
};

export default Dashboard;
