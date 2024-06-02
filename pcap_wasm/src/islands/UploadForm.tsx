import useFileUpload from "@/islands/FileUploadContext.tsx";

const UploadForm = () => {
  const { state, dispatch, analyseFile } = useFileUpload();
 
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      dispatch({ type: "SET_FILE", payload: file });
    }
  };

  const handleAnalyseClick = () => {
    if (state.file) {
      analyseFile(state.file);
    }
  };

  return (
    <div class="upload-form flex items-center justify-between w-full max-w-lg mb-8 space-x-4">
      <label class="block flex-grow">
        <span class="sr-only">Choose File</span>
        <input 
          type="file" 
          onChange={handleFileChange} 
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
      </label>
      <button
        onClick={handleAnalyseClick} 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Analyse
      </button>
      <div class={`flex items-center ${state.loading ? 'visible' : 'invisible'}`}>
        <div class="spinner border-4 border-gray-700 border-t-4 border-t-blue-500 rounded-[50%] w-6 h-6 animate-spin"></div>
      </div>
    </div>
  );
};

export default UploadForm;
