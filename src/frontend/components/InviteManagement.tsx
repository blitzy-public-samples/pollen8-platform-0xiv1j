import React, { useState, useEffect } from 'react';
import { Button } from 'src/frontend/components/ui/Button';
import { Modal } from 'src/frontend/components/ui/Modal';
import { FormInput } from 'src/frontend/components/ui/Form';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';
import { Invite } from 'src/shared/types/index';
import { generateInviteCode } from 'src/shared/utils/index';
import * as d3 from 'd3';

interface InviteData {
  invite: Invite;
  activityData: { date: string; clicks: number }[];
}

export const InviteManagement: React.FC = () => {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const api = useApi();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/invites/${user.id}`);
      setInvites(response.data);
    } catch (error) {
      console.error('Error fetching invites:', error);
      // TODO: Implement proper error handling
    } finally {
      setLoading(false);
    }
  };

  const renderInviteList = () => {
    return invites.map((inviteData) => (
      <div key={inviteData.invite.id} className="mb-4 p-4 border rounded">
        <p>Invite Code: {inviteData.invite.inviteCode}</p>
        <p>Clicks: {inviteData.invite.clicks}</p>
        <Button onClick={() => handleCopyInvite(inviteData.invite.inviteCode)}>Copy Link</Button>
        <Button onClick={() => handleDeleteInvite(inviteData.invite.id)}>Delete</Button>
        {renderActivityGraph(inviteData)}
      </div>
    ));
  };

  const renderActivityGraph = (inviteData: InviteData) => {
    const svgRef = React.useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        const width = 300;
        const height = 150;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const x = d3.scaleTime()
          .domain(d3.extent(inviteData.activityData, d => new Date(d.date)) as [Date, Date])
          .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
          .domain([0, d3.max(inviteData.activityData, d => d.clicks) || 0])
          .range([height - margin.bottom, margin.top]);

        svg.selectAll("*").remove();

        svg.append("g")
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x));

        svg.append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));

        const line = d3.line<{ date: string; clicks: number }>()
          .x(d => x(new Date(d.date)))
          .y(d => y(d.clicks));

        svg.append("path")
          .datum(inviteData.activityData)
          .attr("fill", "none")
          .attr("stroke", theme === 'dark' ? "white" : "black")
          .attr("stroke-width", 1.5)
          .attr("d", line);
      }
    }, [inviteData, theme]);

    return (
      <div className="activity-graph">
        <svg ref={svgRef} width={300} height={150}></svg>
      </div>
    );
  };

  const handleGenerateInvite = async () => {
    try {
      const newInviteCode = generateInviteCode();
      const response = await api.post('/invites', { inviteCode: newInviteCode });
      setInvites([...invites, response.data]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error generating invite:', error);
      // TODO: Implement proper error handling
    }
  };

  const handleCopyInvite = (inviteCode: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteCode}`);
    // TODO: Show a success message to the user
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await api.delete(`/invites/${inviteId}`);
      setInvites(invites.filter(invite => invite.invite.id !== inviteId));
    } catch (error) {
      console.error('Error deleting invite:', error);
      // TODO: Implement proper error handling
    }
  };

  const renderGenerateInviteModal = () => (
    <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} title="Generate New Invite">
      <p>Generate a new invite link to share with others.</p>
      <Button onClick={handleGenerateInvite}>Generate Invite</Button>
    </Modal>
  );

  return (
    <div className="invite-management">
      <h1>Invite Management</h1>
      <Button onClick={() => setModalVisible(true)}>Generate New Invite</Button>
      {loading ? (
        <p>Loading invites...</p>
      ) : (
        renderInviteList()
      )}
      {renderGenerateInviteModal()}
    </div>
  );
};