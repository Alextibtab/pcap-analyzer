import { useState } from "preact/hooks";

import Results from "@/islands/Results.tsx";
import NetworkGraph from "@/islands/Graph/Graph.tsx";
import useFileUpload from "@/islands/FileUploadContext.tsx";

const ViewSwitcher = () => {
  const { state } = useFileUpload();
  const [view, setView] = useState<"results" | "graph">("results");

  if (!state.analysisResult) {
    return null; // Don't render if there's no analysis result
  }

  return (
    <div class="flex flex-col w-4/5 items-center mb-4 p-2 bg-gray-800 shadow-sm hover:shadow-2xl transition-shadow duration-500 rounded">
      <div class="w-full py-2">
      <button
        class={`px-4 py-2 rounded mr-2 ${view === 'results' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        onClick={() => setView("results")}
      >
        View Results
      </button>
      <button
        class={`px-4 py-2 rounded ${view === 'graph' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        onClick={() => setView("graph")}
      >
        View Graph
      </button>
      </div>
      { view === "results" ? (<Results />) : (<NetworkGraph />)}
    </div>
  );
};

export default ViewSwitcher;
