import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'src/frontend/components/ui/Button';
import Modal from 'src/frontend/components/ui/Modal';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi, useNetworkValue } from 'src/shared/hooks/index';
import { User } from 'src/shared/types/index';

interface ProfileData {
  user: User;
  networkValue: number;
  connectionCount: number;
}

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuthContext();
  const { theme } = useThemeContext();
  const { data: profileData, error, isLoading } = useApi<ProfileData>(`/api/users/${userId}`);
  const { networkValue } = useNetworkValue(userId);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    // Any additional side effects can be handled here
  }, [userId]);

  const renderProfileBanner = () => {
    if (!profileData) return null;
    return (
      <div className={`bg-${theme === 'dark' ? 'gray-800' : 'gray-100'} p-6 rounded-lg shadow-md`}>
        <div className="flex items-center">
          <div className="relative">
            <img
              src={profileData.user.avatarUrl || '/default-avatar.png'}
              alt={`${profileData.user.username}'s avatar`}
              className="w-24 h-24 rounded-full animate-pulse"
            />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold">{profileData.user.username}</h1>
            <p className="text-gray-600">{profileData.user.location}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMetadataGrid = () => {
    if (!profileData) return null;
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Industries</h2>
          <ul>
            {profileData.user.industries.map((industry) => (
              <li key={industry.id} className="mb-1">{industry.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Interests</h2>
          <ul>
            {profileData.user.interests.map((interest) => (
              <li key={interest.id} className="mb-1">{interest.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderNetworkStatistics = () => {
    if (!profileData) return null;
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Network Statistics</h2>
        <div className="flex justify-between">
          <div>
            <p className="text-lg">Network Value</p>
            <p className="text-2xl font-bold">{networkValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg">Connections</p>
            <p className="text-2xl font-bold">{profileData.connectionCount}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderActionButtons = () => {
    const isOwnProfile = currentUser?.id === userId;
    return (
      <div className="mt-6 flex justify-end space-x-4">
        {isOwnProfile && (
          <>
            <Button onClick={handleManageInvites}>Manage Invites</Button>
            <Button onClick={handleManageAccount}>Manage Account</Button>
          </>
        )}
      </div>
    );
  };

  const handleManageInvites = () => {
    setIsInviteModalOpen(true);
  };

  const handleManageAccount = () => {
    // Navigate to account management page
    // This would typically use a routing library like react-router
    console.log('Navigate to account management');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profileData) return <div>No profile data available</div>;

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      {renderProfileBanner()}
      {renderMetadataGrid()}
      {renderNetworkStatistics()}
      {renderActionButtons()}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Manage Invites"
      >
        {/* Invite management content goes here */}
        <p>Invite management functionality to be implemented</p>
      </Modal>
    </div>
  );
};