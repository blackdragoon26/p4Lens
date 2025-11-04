import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post("http://localhost:8000/upload", form);
    setStructure(res.data.structure);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">P4Lens Lite</h1>
      <input
        type="file"
        className="border p-2 rounded"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={upload}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>

      {structure && (
        <div className="mt-8 w-full max-w-lg text-left">
          <h2 className="font-semibold text-lg mb-2">Detected Structure:</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify(structure, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
