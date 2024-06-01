import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState, useContext } from "preact/hooks";
import { ComponentChildren, createContext } from "preact";

const ForceGraphContext = createContext<any | null>(null);

function ForceGraphProvider(props: { children: ComponentChildren }) {
  const [ForceGraph2D, setForceGraph2D] = useState<any | null>(null);

  useEffect(() => {
    if (IS_BROWSER) {
      import("npm:react-force-graph-2d").then((module) => {
        const ForceGraph2D = module.default;
        setForceGraph2D(<ForceGraph2D />);
      }).catch((error) => {
        console.error("Failed to load react-force-graph-2d:", error);
      });
    }
  }, []);

  if (!IS_BROWSER) {
    return <p>ForceGraph must be loaded on the client</p>;
  }

  return (
    <ForceGraphContext.Provider value={ForceGraph2D}>
      {props.children}
    </ForceGraphContext.Provider>
  );
}

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

const NetworkComponent = ({ connections }: { connections: Connection[] }) => {
  const ForceGraph2D = useContext(ForceGraphContext);

  console.log(ForceGraph2D);
  const graphData = prepareGraphData(connections);

  if (!ForceGraph2D) {
    return <div>Loading graph...</div>;
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeAutoColorBy="id"
      linkDirectionalArrowLength={6}
      linkDirectionalArrowRelPos={1}
      linkLabel="label"
    />
  );
};

export default function NetworkGraph({ connections }: { connections: Connection[] }) {
  return (
    <ForceGraphProvider>
      <NetworkComponent connections={connections} />
    </ForceGraphProvider>
  );
}

