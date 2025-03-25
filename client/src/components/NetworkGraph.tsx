import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import { Card } from '@/components/ui/card';
import { NetworkNode, NetworkLink } from '@shared/types';

interface NodeTooltipProps {
  node: NetworkNode | null;
  position: { x: number; y: number } | null;
}

function NodeTooltip({ node, position }: NodeTooltipProps) {
  if (!node || !position) return null;
  
  return (
    <Card 
      className="absolute p-3 rounded-lg text-xs font-mono z-10 shadow-lg border border-slate-600 bg-slate-800/90 backdrop-blur-sm"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <div className="flex flex-col">
        <span className="text-slate-400">Chain: <span className="text-accent">{node.name}</span></span>
        <span className="text-slate-400">Stage: <span className="text-primary">{node.stage}</span></span>
        <span className="text-slate-400">EID: <span className="text-slate-200">{node.eid}</span></span>
        <span className="text-slate-400">Connections: <span className="text-secondary">{node.connections}</span></span>
      </div>
    </Card>
  );
}

export default function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/network'],
  });
  
  useEffect(() => {
    if (!svgRef.current || !data || isLoading) return;
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Add links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', 'rgba(99, 102, 241, 0.6)')
      .style('stroke-width', 1.5);
    
    // Add nodes
    const nodeGroup = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g');
    
    // Add circles to node groups
    nodeGroup.append('circle')
      .attr('class', 'node')
      .attr('r', 8)
      .style('fill', (d: any) => {
        const colors = [
          '#6366F1', // primary
          '#3B82F6', // secondary
          '#22D3EE', // accent
          '#F97316', // orange
          '#EC4899'  // pink
        ];
        return colors[d.group % colors.length];
      })
      .style('stroke', '#22D3EE')
      .style('stroke-width', 2)
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 10)
          .style('fill', '#22D3EE');
        
        setHoveredNode(d);
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 8)
          .style('fill', (d: any) => {
            const colors = [
              '#6366F1', '#3B82F6', '#22D3EE', '#F97316', '#EC4899'
            ];
            return colors[d.group % colors.length];
          });
        
        setHoveredNode(null);
        setTooltipPosition(null);
      })
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);
    
    // Add labels to node groups
    nodeGroup.append('text')
      .attr('dx', 0)
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono')
      .attr('fill', '#F8FAFC')
      .text((d: any) => d.name);
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
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
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, isLoading]);
  
  return (
    <div className="relative h-full w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
        </div>
      ) : (
        <>
          <svg ref={svgRef} width="100%" height="100%"></svg>
          <NodeTooltip node={hoveredNode} position={tooltipPosition} />
        </>
      )}
    </div>
  );
}
