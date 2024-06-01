import { createContext } from "preact";
import { useContext, useReducer } from "preact/hooks";
import { asset } from "$fresh/runtime.ts";

import { analyze_pcap_data, instantiate } from "@/lib/pcap_wasm.generated.js";

type State = {
  file: File | null;
  analysisResult: any | null;
};

type Action = 
  | { type: "SET_FILE"; payload: File }
  | { type: "SET_ANALYSIS_RESULT"; payload: any }; 

type FileUploadContextType = {
  state: State,
  dispatch: (action: Action) => void;
  handleFileChange: (event: Event) => void;
  analyzeFile: () => void;
}

const FileUploadContext = createContext<
  FileUploadContextType | undefined
>(undefined);

const reducer = (state: State, action: Action): State => {
  console.log("Dispatching action:", action);
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_ANALYSIS_RESULT":
      return { ...state, analysisResult: action.payload };
    default:
      return state;
  }
};

const FileUploadProvider = (
  { children }: { children: preact.ComponentChildren },
) => {
  const [state, dispatch] = useReducer(reducer, { file: null, analysisResult: null });

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      dispatch({ type: "SET_FILE", payload: file });
    }
  };

  const analyzeFile = async () => {
    if (!state.file) {
      alert('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result;
      if (contents instanceof ArrayBuffer) {
        const url = new URL(asset("/pcap_wasm_bg.wasm"), "http://localhost:3000");
        await instantiate({url: url});
        const result = analyze_pcap_data(new Uint8Array(contents));
        dispatch({ type: "SET_ANALYSIS_RESULT", payload: result });
      }
    };
    reader.readAsArrayBuffer(state.file);
  };

  return (
    <FileUploadContext.Provider value={{ state, dispatch, handleFileChange, analyzeFile }}>
      {children}
    </FileUploadContext.Provider>
  );
};

const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
};

export { FileUploadProvider }; 
export default useFileUpload;
