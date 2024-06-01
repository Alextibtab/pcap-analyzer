const ToolBar = ({ onResetCamera, onSetMinCount }) => {
  const handleMinCountChange = (e) => {
    const minCount = parseInt(e.target.value, 10);
    if (!isNaN(minCount)) {
      onSetMinCount(minCount);
    }
  };

  return (
    <div class="flex space-x-4 mb-4 p-4 bg-gray-800 text-white rounded">
      <button onClick={onResetCamera} class="px-4 py-2 bg-blue-500 rounded">Reset Camera</button>
      <div class="flex items-center">
        <label for="minCount" class="mr-2">Min Count:</label>
        <input type="number" id="minCount" onChange={handleMinCountChange} class="px-2 py-1 text-black rounded" />
      </div>
    </div>
  );
};

export default ToolBar;
