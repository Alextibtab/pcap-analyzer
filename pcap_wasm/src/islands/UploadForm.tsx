import useFileUpload from "@/islands/FileUploadContext.tsx";

const UploadForm = () => {
  const { handleFileChange, analyzeFile } = useFileUpload();

  return (
    <div class="upload-form flex items-center justify-between w-full max-w-lg mb-8 space-x-4">
      <label class="block flex-grow">
        <span class="sr-only">Choose File</span>
        <input 
          type="file" 
          onChange={handleFileChange} 
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </label>
      <button
        onClick={analyzeFile} 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Analyze
      </button>
    </div>
  );
};

export default UploadForm;
