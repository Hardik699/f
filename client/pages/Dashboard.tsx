import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, FileText, Settings, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";

interface DashboardUser {
  username: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/");
      return;
    }

    setUser({ username });
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout title={`Welcome back, ${user?.username}!`}>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Here's an overview of your application. More features coming soon.
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Users"
          value="0"
          change="+0 this week"
          color="blue"
        />
        <StatCard
          icon={FileText}
          title="Documents"
          value="0"
          change="+0 this week"
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          title="Analytics"
          value="0"
          change="View details"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Activity"
          value="Real-time"
          change="All synced"
          color="orange"
        />
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Getting Started
          </h3>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              Welcome to your Faction Dashboard! This is your admin portal where
              you can manage all aspects of your application.
            </p>
            <ul className="space-y-3 pl-5 list-disc">
              <li>Database is connected and all features are available</li>
              <li>All data is synced in real-time across users</li>
              <li>More sections will be added as you develop your app</li>
            </ul>
            <p className="pt-4 text-sm italic">
              💡 Tip: Check the top-right corner for the database connection
              status indicator.
            </p>
          </div>
        </div>

        {/* Sidebar section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors font-medium text-sm text-left">
              Settings
            </button>
            <button className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm text-left">
              Documentation
            </button>
            <button className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm text-left">
              Support
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  value: string;
  change: string;
  color: "blue" | "purple" | "green" | "orange";
}

function StatCard({ icon: Icon, title, value, change, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    purple:
      "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    orange:
      "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {title}
      </h3>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
        {change}
      </p>
    </div>
  );
}
