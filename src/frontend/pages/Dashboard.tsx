import React, { useState, useEffect } from 'react';
import { AccountDashboard } from 'src/frontend/components/AccountDashboard';
import { NetworkVisualization } from 'src/frontend/components/NetworkVisualization';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi, useNetworkValue } from 'src/shared/hooks/index';
import { User, NetworkValue } from 'src/shared/types/index';

interface DashboardData {
  user: User;
  networkValue: NetworkValue;
  connections: number;
  recentActivity: any[]; // Define a more specific type if possible
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { networkValue } = useNetworkValue(user?.id);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await api.get<DashboardData>(`/dashboard/${user.id}`);
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, api]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center">No dashboard data available.</div>;
  }

  return (
    <div className={`dashboard ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountDashboard 
          user={dashboardData.user}
          networkValue={networkValue || dashboardData.networkValue}
          connections={dashboardData.connections}
        />
        <NetworkVisualization userId={user?.id} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Create Invite
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Manage Connections
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        {dashboardData.recentActivity.length > 0 ? (
          <ul className="space-y-2">
            {dashboardData.recentActivity.map((activity, index) => (
              <li key={index} className="bg-gray-100 p-3 rounded dark:bg-gray-800">
                {activity.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity to display.</p>
        )}
      </div>

      <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 p-4 dark:bg-yellow-900 dark:border-yellow-600" role="alert">
        <p className="font-bold">Notifications</p>
        <p>You have 3 new connection requests. <a href="#" className="underline">View them here</a>.</p>
      </div>
    </div>
  );
};