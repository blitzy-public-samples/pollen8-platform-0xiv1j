import React, { useState, useEffect } from 'react';
import { InviteManagement } from 'src/frontend/components/InviteManagement';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';
import { Invite } from 'src/shared/types/index';

export const Invites: React.FC = () => {
  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const api = useApi();

  const fetchInvites = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/invites?page=${pageNum}&limit=10`);
      const newInvites = response.data.invites;
      setInvites(prev => pageNum === 1 ? newInvites : [...prev, ...newInvites]);
      setHasMore(newInvites.length === 10);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvites(1);
    }
  }, [user]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchInvites(page + 1);
    }
  };

  const calculateOverallStats = () => {
    const totalInvites = invites.length;
    const totalClicks = invites.reduce((sum, invite) => sum + invite.clicks, 0);
    const conversionRate = totalClicks > 0 ? (invites.filter(invite => invite.accepted).length / totalClicks) * 100 : 0;

    return { totalInvites, totalClicks, conversionRate };
  };

  if (!user) {
    return <div>Please log in to view your invites.</div>;
  }

  return (
    <div className={`invites-page ${theme}`}>
      <h1>Your Invites</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="overall-stats">
        <h2>Overall Statistics</h2>
        {loading && invites.length === 0 ? (
          <p>Loading statistics...</p>
        ) : (
          (() => {
            const { totalInvites, totalClicks, conversionRate } = calculateOverallStats();
            return (
              <>
                <p>Total Invites: {totalInvites}</p>
                <p>Total Clicks: {totalClicks}</p>
                <p>Conversion Rate: {conversionRate.toFixed(2)}%</p>
              </>
            );
          })()
        )}
      </div>

      <InviteManagement invites={invites} />

      {loading && <div className="loading-indicator">Loading invites...</div>}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};