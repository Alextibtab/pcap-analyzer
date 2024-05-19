import { useFileUpload } from "@/islands/FileUploadContext.tsx";
import { useEffect, useState } from "preact/hooks";

const sortMapByValue = (map: Map<string, number>): [string, number][] => {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

const renderTable = (title: string, data: Map<string, number>) => {
  const sortedData = sortMapByValue(data);
  return (
    <div class="w-full max-w-xs overflow-hidden bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      <h2 class="text-xl font-bold mb-2">{title}</h2>
      <div class="max-h-64 overflow-y-auto">
        <table class="table-auto w-full">
          <thead>
            <tr>
              <th class="px-4 py-2">Key</th>
              <th class="px-4 py-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(([key, count], index) => (
              <tr key={key}>
                <td class="border px-4 py-2">{key}</td>
                <td class="border px-4 py-2">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Results() {
  const { state } = useFileUpload();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.analysisResult) {
      setVisible(true);
    }
  }, [state.analysisResult]);

  return (
    <div class={`results grid grid-cols-1 md:grid-cols-2 gap-4 p-4 transition-all duration-500 ease-in-out ${visible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-8'}`}>
      {state.analysisResult ? (
        <>
          {renderTable("IP Counts", state.analysisResult.ip_counts)}
          {renderTable("Layer 4 Protocol Counts", state.analysisResult.layer_4_counts)}
          {renderTable("Protocol Counts", state.analysisResult.protocol_counts)}
        </>
      ) : (
        <p>No results yet</p>
      )}
    </div>
  );
}