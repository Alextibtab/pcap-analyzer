import { FileUploadProvider } from "../islands/FileUploadContext.tsx";
import Results from "@/islands/Results.tsx";
import UploadForm from "../islands/UploadForm.tsx";

export default function Home() {
  return (
    <FileUploadProvider>
      <div class="min-h-screen flex flex-col bg-gray-900 text-white font-mono p-4">
        <div class="header w-full mb-8 text-center bg-gray-900 p-4 z-10">
          <h1 class="text-4xl font-bold mb-2">Welcome to the PCAP Analyzer</h1>
          <p class="text-lg">Analyze your PCAP files with ease.</p>
        </div>
        <div class="content flex flex-col items-center space-y-8 w-full p-4">
          <UploadForm />
          <Results />
        </div>
      </div>
    </FileUploadProvider>
  );
}
