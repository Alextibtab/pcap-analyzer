import { createContext, h } from "preact";
import { useContext, useReducer } from "preact/hooks";

type State = {
  file: File | null;
};

type Action = {
  type: "SET_FILE";
  payload: File;
};

const FileUploadContext = createContext<
  [State, (action: Action) => void] | undefined
>(undefined);

function reducer(state: State, action: Action): State {
  console.log("Dispatching action:", action);
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.payload };
    default:
      return state;
  }
}

export function FileUploadProvider(
  { children }: { children: preact.ComponentChildren },
) {
  const [state, dispatch] = useReducer(reducer, { file: null });

  return (
    <FileUploadContext.Provider value={[state, dispatch]}>
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
}
