import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';
import { User, Connection } from 'src/shared/types/index';
import * as d3 from 'd3';

interface NetworkVisualizationProps {
  userId: string;
  width: number;
  height: number;
}

interface NetworkData {
  nodes: { id: string; name: string; industry: string }[];
  links: { source: string; target: string }[];
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ userId, width, height }) => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useThemeContext();
  const { fetchData } = useApi();

  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      try {
        const data = await fetchData(`/api/network/${userId}`);
        setNetworkData(data);
      } catch (error) {
        console.error('Error fetching network data:', error);
        // TODO: Implement proper error handling
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, [userId, fetchData]);

  useEffect(() => {
    if (networkData && svgRef.current) {
      if (d3.select(svgRef.current).selectAll('*').empty()) {
        createVisualization(svgRef.current, networkData, theme);
      } else {
        updateVisualization(svgRef.current, networkData, theme);
      }
    }
  }, [networkData, theme]);

  const createVisualization = (svgElement: SVGSVGElement, data: NetworkData, theme: string) => {
    const svg = d3.select(svgElement);
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', theme === 'dark' ? '#555' : '#999')
      .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => getColorByIndustry(d.industry))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text((d: any) => d.name)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4)
      .style('fill', theme === 'dark' ? '#fff' : '#000');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    svg.call(zoom as any);

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const updateVisualization = (svgElement: SVGSVGElement, data: NetworkData, theme: string) => {
    const svg = d3.select(svgElement);

    // Update nodes
    const node = svg.selectAll('circle')
      .data(data.nodes, (d: any) => d.id);

    node.enter().append('circle')
      .attr('r', 5)
      .merge(node as any)
      .attr('fill', (d: any) => getColorByIndustry(d.industry));

    node.exit().remove();

    // Update links
    const link = svg.selectAll('line')
      .data(data.links, (d: any) => `${d.source.id}-${d.target.id}`);

    link.enter().append('line')
      .merge(link as any)
      .attr('stroke', theme === 'dark' ? '#555' : '#999')
      .attr('stroke-opacity', 0.6);

    link.exit().remove();

    // Update labels
    const label = svg.selectAll('text')
      .data(data.nodes, (d: any) => d.id);

    label.enter().append('text')
      .merge(label as any)
      .text((d: any) => d.name)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4)
      .style('fill', theme === 'dark' ? '#fff' : '#000');

    label.exit().remove();

    // Update simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation.on('tick', () => {
      svg.selectAll('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      svg.selectAll('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      svg.selectAll('text')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  };

  const handleNodeClick = (node: any, event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Implement node click behavior (e.g., highlight connections, show details)
    console.log('Node clicked:', node);
  };

  const getColorByIndustry = (industry: string) => {
    // TODO: Implement a color scheme for industries
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    return colorScale(industry);
  };

  if (loading) {
    return <div>Loading network visualization...</div>;
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc' }}
      role="img"
      aria-label="Network visualization"
    >
      {/* SVG content will be populated by D3 */}
    </svg>
  );
};