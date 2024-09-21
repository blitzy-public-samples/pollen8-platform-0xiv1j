import React, { useState, useEffect } from 'react';
import { Button } from 'src/frontend/components/ui/Button';
import { Modal } from 'src/frontend/components/ui/Modal';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi, useNetworkValue } from 'src/shared/hooks/index';
import { User, NetworkValue } from 'src/shared/types/index';
import * as d3 from 'd3';

interface DashboardData {
  user: User;
  networkValue: NetworkValue;
  connectionCount: number;
  industryNetworks: { [key: string]: number };
}

export const AccountDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const { fetchData } = useApi();
  const { networkValue } = useNetworkValue(user?.id);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<DashboardData>(`/api/dashboard/${user?.id}`);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // TODO: Implement proper error handling
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchData]);

  const renderAccountInfo = () => {
    if (!dashboardData) return null;
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{dashboardData.user.username}</h2>
        <p className="text-gray-600 dark:text-gray-300">{dashboardData.user.location}</p>
        <Button onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
      </div>
    );
  };

  const renderNetworkStatistics = () => {
    if (!dashboardData) return null;
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Network Statistics</h3>
        <p>Network Value: {dashboardData.networkValue.value}</p>
        <p>Connections: {dashboardData.connectionCount}</p>
      </div>
    );
  };

  const renderIndustryNetworks = (industryNetworks: { [key: string]: number }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Industry Networks</h3>
        {Object.entries(industryNetworks).map(([industry, count]) => (
          <div key={industry} className="mb-2">
            <h4 className="font-medium">{industry}</h4>
            <p>{count} connections</p>
          </div>
        ))}
      </div>
    );
  };

  const renderNetworkFeed = (user: User) => {
    // TODO: Implement network feed functionality
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Network Feed</h3>
        <p>Network feed coming soon...</p>
      </div>
    );
  };

  const renderStarConstellationBackground = () => {
    useEffect(() => {
      const svg = d3.select('#star-background');
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Generate random stars
      const stars = d3.range(100).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
      }));

      // Create star elements
      svg.selectAll('circle')
        .data(stars)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .attr('fill', theme === 'dark' ? 'white' : 'black')
        .style('opacity', () => Math.random())
        .transition()
        .duration(1000)
        .style('opacity', () => Math.random())
        .repeat();

      // TODO: Implement constellation lines
    }, [theme]);

    return <svg id="star-background" className="fixed top-0 left-0 w-full h-full -z-10" />;
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleManageConnections = () => {
    // TODO: Implement navigation to connections management page
  };

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Implement proper loading state
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>; // TODO: Implement proper error state
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {renderStarConstellationBackground()}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Account Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {renderAccountInfo()}
            {renderNetworkStatistics()}
            {renderNetworkFeed(dashboardData.user)}
          </div>
          <div className="md:col-span-1">
            {renderIndustryNetworks(dashboardData.industryNetworks)}
            <Button onClick={handleManageConnections} className="mt-4 w-full">
              Manage Connections
            </Button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        {/* TODO: Implement profile editing form */}
        <p>Profile editing form coming soon...</p>
      </Modal>
    </div>
  );
};