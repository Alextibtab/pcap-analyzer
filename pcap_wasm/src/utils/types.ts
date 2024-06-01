interface Node {
  id: string;
  count: number;
};

interface Link {
  source: string;
  target: string;
  label: string;
};

interface GraphData {
  nodes: Node[];
  links: Link[];
};

interface Connection {
  src_ip: string;
  dst_ip: string;
  count: number;
};

export type { Node, Link, GraphData, Connection };
