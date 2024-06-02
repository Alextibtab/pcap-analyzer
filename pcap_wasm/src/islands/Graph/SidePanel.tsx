const SidePanel = ({ selectedNode, selectedLink }) => {
  return (
    <div class="p-4 h-full border-2 border-gray-600 text-white rounded">
      {selectedNode ? (
        <div>
          <h2 class="text-xl font-bold">Node Details</h2>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Count:</strong> {selectedNode.count}</p>
        </div>
      ) : selectedLink ? (
        <div>
          <h2 class="text-xl font-bold">Link Details</h2>
          <p><strong>Source:</strong> {selectedLink.source.id}</p>
          <p><strong>Target:</strong> {selectedLink.target.id}</p>
          <p><strong>Label:</strong> {selectedLink.label}</p>
        </div>
      ) : (
        <p>Select a node or link to see details</p>
      )}
    </div>
  );
};

export default SidePanel;
