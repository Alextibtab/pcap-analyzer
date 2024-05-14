import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { FileUploadProvider } from "../islands/FileUploadContext.tsx";
import UploadForm from "../islands/UploadForm.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1>PCAP Analyzer</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium
          nostrum neque vitae assumenda hic ab, libero unde explicabo
          cupiditate? Veritatis?
        </p>
        <Counter count={count} />
        <FileUploadProvider>
          <UploadForm />
        </FileUploadProvider>
      </div>
    </div>
  );
}
