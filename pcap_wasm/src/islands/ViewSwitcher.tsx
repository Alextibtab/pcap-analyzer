import { useState } from "preact/hooks";

import Results from "@/islands/Results.tsx";
import NetworkGraph from "@/islands/Graph/Graph.tsx";

const ViewSwitcher = () => {
  const [view, setView] = useState<"results" | "graph">('results');

  return (
    <div class="flex flex-col items-center space-y-8 w-full p-4">
      <div class="flex space-x-4">
        <button
          class={`px-4 py-2 rounded ${view === 'results' ? 'bg-blue-500' : 'bg-gray-700'}`}
          onClick={() => setView('results')}
        >
          Results
        </button>
        <button
          class={`px-4 py-2 rounded ${view === 'graph' ? 'bg-blue-500' : 'bg-gray-700'}`}
          onClick={() => setView('graph')}
        >
          Graph
        </button>
      </div>
      {view === 'results' ? <Results /> : <NetworkGraph />}
    </div> 
  );
};

export default ViewSwitcher;
