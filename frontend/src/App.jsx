// import { useState } from "react";
// import axios from "axios";

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [structure, setStructure] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const upload = async () => {
//     if (!file) return;
//     setLoading(true);
//     const form = new FormData();
//     form.append("file", file);
//     const res = await axios.post("http://localhost:8000/upload", form);
//     setStructure(res.data.structure);
//     setLoading(false);
//   };

//   return (
//     <div className="flex flex-col items-center p-8 font-sans">
//       <h1 className="text-3xl font-bold mb-6">P4Lens Lite</h1>
//       <input
//         type="file"
//         className="border p-2 rounded"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <button
//         onClick={upload}
//         className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
//       >
//         {loading ? "Parsing..." : "Upload & Parse"}
//       </button>

//       {structure && (
//         <div className="mt-8 w-full max-w-lg text-left">
//           <h2 className="font-semibold text-lg mb-2">Detected Structure:</h2>
//           <pre className="bg-gray-100 p-3 rounded text-sm">
//             {JSON.stringify(structure, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";
import PipelineFlow from "@/components/ui/PipelineFlow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function App() {
  const [file, setFile] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Upload and parse ----------
  const upload = async () => {
    if (!file) {
      setError("Please choose a P4 file first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post("/api/upload", form);
      console.log("Parsed structure:", res.data.structure);
      setStructure(res.data.structure);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to parse P4 file. Please check the file format.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset ----------
  const reset = () => {
    setStructure(null);
    setFile(null);
    setError(null);
  };

  // ---------- Loading / Upload View ----------
  if (!structure || Object.keys(structure).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-200 text-center p-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-slate-800 mb-2">P4Lens</h1>
          <p className="text-slate-600 text-lg">Interactive P4 Program Visualizer</p>
        </div>
        
        <Card className="w-full max-w-lg shadow-xl bg-white/95 backdrop-blur-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Upload a <span className="text-blue-600">P4 Program</span>
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Visualize parser, ingress, egress, and deparser flow
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full">
              <input
                type="file"
                accept=".p4"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setError(null);
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
            <Button
              onClick={upload}
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Parsing...
                </span>
              ) : "Upload & Visualize"}
            </Button>
            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Supports P4<sub>14</sub> and P4<sub>16</sub> programs
          </p>
          <div className="flex gap-4 justify-center text-xs text-slate-500">
            <span>✓ Parser States</span>
            <span>✓ Control Blocks</span>
            <span>✓ Tables & Actions</span>
            <span>✓ Headers</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Visualization View ----------
  return (
    <div className="w-screen h-screen relative">
      <PipelineFlow structure={structure} />
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={reset}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md"
        >
          ← Upload Another File
        </Button>
      </div>
    </div>
  );
}
