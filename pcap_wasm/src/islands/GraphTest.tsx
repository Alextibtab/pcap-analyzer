import { Suspense, lazy } from "preact/compat";

interface Connection {
  src_ip: string;
  dst_ip: string;
  count: number;
}

const prepareGraphData = (connections: Connection[]) => {
  const nodes = new Map<string, { id: string }>();
  const links = connections.map((connection) => {
    if (!nodes.has(connection.src_ip)) {
      nodes.set(connection.src_ip, { id: connection.src_ip });
    }
    if (!nodes.has(connection.dst_ip)) {
      nodes.set(connection.dst_ip, { id: connection.dst_ip });
    }

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

export default function NetworkGraph({ connections }: { connections: Connection[] }) {
  const ForceGraph2D = lazy(() => import("npm:react-force-graph-2d")) 
  const graphData = prepareGraphData(connections);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <ForceGraph2D
        graphData={graphData}
        linkLabel="label"
      />
    </Suspense>
  );
};


