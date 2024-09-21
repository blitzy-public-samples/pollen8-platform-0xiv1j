import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from 'src/frontend/components/UserProfile';
import NetworkVisualization from 'src/frontend/components/NetworkVisualization';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';
import { User } from 'src/shared/types/index';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthContext();
  const { theme } = useThemeContext();
  const { fetchData, error } = useApi();

  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData(`/api/users/${userId}`);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, fetchData]);

  if (isLoading) {
    return <div className="text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="text-center">User not found</div>;
  }

  const isOwnProfile = currentUser?.id === profileData.id;

  return (
    <div className={`profile-page ${theme}`}>
      <UserProfile user={profileData} />
      <NetworkVisualization userId={profileData.id} />
      
      {isOwnProfile && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Edit Profile</h2>
          {/* Add edit profile form or link here */}
        </div>
      )}
    </div>
  );
};

// Add metadata for SEO
Profile.metadata = {
  title: 'User Profile | Pollen8',
  description: 'View user profile and network visualization on Pollen8',
};