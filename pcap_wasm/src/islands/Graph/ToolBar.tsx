const ToolBar = ({ onResetCamera, onSetMinCount, view, onSetView }) => {
  const handleMinCountChange = (e) => {
    const minCount = parseInt(e.target.value, 10);
    if (!isNaN(minCount)) {
      onSetMinCount(minCount);
    }
  };

  const handleViewChange = (e) => {
    onSetView(e.target.value);
  };

  return (
    <div class="flex justify-between items-center w-full space-x-4 mb-4 p-4 border-2 border-gray-600 text-white rounded">
      <div class="flex items-center">
        <label for="minCount" class="mr-2">Min Packets:</label>
        <input type="number" id="minCount" onChange={handleMinCountChange} class="px-2 py-1 mr-2 text-black rounded" />
        <label class="mr-2">
          <input
            type="radio"
            name="view"
            value="2d"
            checked={view === '2d'}
            onChange={handleViewChange}
          /> 2D
        </label>
        <label>
          <input
            type="radio"
            name="view"
            value="3d"
            checked={view === '3d'}
            onChange={handleViewChange}
          /> 3D
        </label>
      </div>
      <div class="flex ml-auto">
      <button onClick={onResetCamera} class="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded">Reset Camera</button>
      </div>
    </div>
  );
};

export default ToolBar;
