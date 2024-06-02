import { useEffect, useState, useRef } from "preact/hooks";
import { Suspense, lazy } from "preact/compat";

import { ForceGraphMethods } from "force-graph-2d";

import useFileUpload from "@/islands/FileUploadContext.tsx";
import SidePanel from "@/islands/Graph/SidePanel.tsx";
import ToolBar from "@/islands/Graph/ToolBar.tsx";
import { Connection, GraphData, Link, Node } from "@/utils/types.ts";

const ForceGraph2D = lazy(() => import('force-graph-2d'));
const ForceGraph3D = lazy(() => import('force-graph-3d'));

const prepareGraphData = (connections: Connection[]): GraphData => {
  const nodes = new Map<string, Node>();
  const links = connections.map((connection) => {
    if (!nodes.has(connection.src_ip)) {
      nodes.set(connection.src_ip, { id: connection.src_ip, count: 0 });
    }
    if (!nodes.has(connection.dst_ip)) {
      nodes.set(connection.dst_ip, { id: connection.dst_ip, count: 0 });
    }
    nodes.get(connection.src_ip)!.count += connection.count;
    nodes.get(connection.dst_ip)!.count += connection.count;

    return {
      source: connection.src_ip,
      target: connection.dst_ip,
      label: `${connection.count} packets`,
    };
  });

  return {
    nodes: Array.from(nodes.values()),
    links: links,
  };
};

const NetworkGraph = () => {
  const { state } = useFileUpload();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData>({ nodes: [], links: []})
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [minCount, setMinCount] = useState(0);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const graphRef = useRef<ForceGraphMethods | null>(null);

  useEffect(() => {
    if (state.analysisResult) {
      const connections: Connection[] = state.analysisResult.connections;
      setGraphData(prepareGraphData(connections));
    }
  }, [state.analysisResult]);
  

  useEffect(() => {
    const filteredNodes = graphData.nodes.filter(node => node.count >= minCount);
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target;
      return filteredNodes.some(node => node.id === sourceId) && filteredNodes.some(node => node.id === targetId);
    });

    setFilteredGraphData({
      nodes: filteredNodes,
      links: filteredLinks,
    });

    if (graphRef.current) {
      const forceGraph = graphRef.current;
      forceGraph.d3Force('link').distance(() => 100);
      forceGraph.d3Force('charge').strength(-120);
    }
  }, [graphData, minCount]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleCameraReset = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    };
  };

  if (!state.analysisResult) {
    return null;
  };

  return (
    <div class="flex flex-col w-full">
      <ToolBar onResetCamera={handleCameraReset} onSetMinCount={setMinCount} view={view} onSetView={setView} />
      <div class="flex flex-row w-full">
        <div class="w-3/4">
          <Suspense fallback={<div>Loading graph...</div>}>
            {view === "2d" ? (
              <ForceGraph2D
                ref={graphRef}
                graphData={filteredGraphData}
                width={1200}
                height={800}
                linkLabel="label"
                linkColor={() => "rgba(211, 211, 211, 0.4)"}
                linkWidth={3}
                nodeLabel={(node: Node) => node.id}
                nodeRelSize={1}
                nodeVal={(node: Node) => node.count}
                nodeColor={(node: Node) => selectedNode && selectedNode.id === node.id ? "rgba(184, 49, 0, 1.0)" : "rgba(255, 127, 80, 0.8)"}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                d3Force="link"
                d3AlphaDecay={0.05}
                d3VelocityDecay={0.4}
              />
            ) : (
              <ForceGraph3D
                ref={graphRef}
                graphData={filteredGraphData}
                width={1200}
                height={800}
                linkLabel="label"
                linkColor={() => "rgba(211, 211, 211, 0.4)"}
                linkWidth={3}
                nodeLabel={(node: Node) => node.id}
                nodeRelSize={1}
                nodeVal={(node: Node) => node.count}
                nodeColor={(node: Node) => selectedNode && selectedNode.id === node.id ? "rgba(184, 49, 0, 1.0)" : "rgba(255, 127, 80, 0.8)"}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                d3Force="link"
                d3AlphaDecay={0.05}
                d3VelocityDecay={0.4}
              />
            )}
          </Suspense>
        </div>
        <div class="w-1/4">
          <SidePanel selectedNode={selectedNode} selectedLink={selectedLink} />
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;

