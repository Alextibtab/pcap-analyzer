import { FileUploadProvider } from "@/islands/FileUploadContext.tsx";
import UploadForm from "@/islands/UploadForm.tsx";
import ViewSwitcher from "@/islands/ViewSwitcher.tsx";

const PcapAnalyser = () => {
  return (
    <FileUploadProvider>
      <div class="min-h-screen flex flex-col bg-gray-900 text-white font-mono p-4">
        <div class="header w-full mb-4 text-center bg-gray-900 p-4 z-10">
          <h1 class="text-6xl font-extrabold mb-1">PCAP Analyser</h1>
        </div>
        <div class="content flex flex-col items-center space-y-1 w-full p-4">
          <UploadForm />
          <ViewSwitcher />
        </div>
      </div>
    </FileUploadProvider>
  );
};

export default PcapAnalyser;
