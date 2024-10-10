import { createContext } from "preact";
import { useContext, useReducer } from "preact/hooks";
import { asset } from "$fresh/runtime.ts";

import { analyze_pcap_data, instantiate } from "@/lib/pcap_wasm.generated.js";

type State = {
  file: File | null;
  analysisResult: any | null;
  loading: boolean;
};

type Action = 
  | { type: "SET_FILE"; payload: File }
  | { type: "SET_ANALYSIS_RESULT"; payload: any }
  | { type: "SET_LOADING"; payload: boolean };

const FileUploadContext = createContext<
  { state: State; dispatch: (action: Action) => void; analyseFile: (file: File) => Promise<void>} | undefined
>(undefined);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_ANALYSIS_RESULT":
      return { ...state, analysisResult: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const FileUploadProvider = (
  { children }: { children: preact.ComponentChildren },
) => {
  const [state, dispatch] = useReducer(reducer, { file: null, analysisResult: null, loading: false });

  const analyseFile = async (file: File) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const wasm_url = new URL(asset("/pcap_wasm_bg.wasm"), 'https://pcap-analyzer.deno.dev/');
        await instantiate({url: wasm_url});
        const result = analyze_pcap_data(new Uint8Array(reader.result as ArrayBuffer));
        dispatch({ type: "SET_ANALYSIS_RESULT", payload: result });
        dispatch({ type: "SET_LOADING", payload: false });
      } catch (error) {
        console.error("Failed to analyse pcap file: ", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <FileUploadContext.Provider value={{ state, dispatch, analyseFile }}>
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
