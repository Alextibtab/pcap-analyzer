import h from "preact";
import { useFileUpload } from "./FileUploadContext.tsx";

export default function UploadForm() {
  const [state, dispatch] = useFileUpload();
  console.log("Context state in UploadForm:", state);

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      dispatch({ type: "SET_FILE", payload: file });
    }
  };

  return (
    <div class="upload-form">
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
