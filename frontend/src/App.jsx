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

  // Upload and parse
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
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to parse P4 file. Please check the file format.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const reset = () => {
    setStructure(null);
    setFile(null);
    setError(null);
  };

  // Loading / Upload View
  if (!structure || Object.keys(structure).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-center p-6">
        <div className="mb-10">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            P4Lens
          </h1>
          <p className="text-slate-700 text-xl font-medium">Professional P4 Program Visualizer</p>
          <p className="text-slate-500 text-sm mt-2">Understand every bit of your P4 pipeline</p>
        </div>
        
        <Card className="w-full max-w-2xl shadow-2xl bg-white/98 backdrop-blur-md border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-slate-800">
              Upload Your <span className="text-blue-600">P4 Program</span>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-3">
              Get comprehensive visualization of parser, control blocks, deparser, and all pipeline stages
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <div className="w-full">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".p4"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError(null);
                  }}
                  className="hidden"
                />
                <div className="w-full border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    {file ? file.name : "Click to select P4 file"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {file ? "File selected ✓" : "or drag and drop your .p4 file here"}
                  </p>
                </div>
              </label>
            </div>
            <Button
              onClick={upload}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing P4 Program...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Visualize Pipeline</span>
                </span>
              )}
            </Button>
            {error && (
              <div className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 text-center max-w-3xl">
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Supports P4<sub>14</sub> and P4<sub>16</sub> programs
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl mb-2">📥</div>
              <div className="text-xs font-semibold text-slate-700">Parser States</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-xs font-semibold text-slate-700">Control Blocks</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-xs font-semibold text-slate-700">Tables & Actions</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-xs font-semibold text-slate-700">Headers</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visualization View
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <PipelineFlow structure={structure} />
      <div className="absolute top-24 left-6 z-10">
        <Button
          onClick={reset}
          className="bg-white/90 hover:bg-white text-slate-800 px-5 py-2.5 rounded-lg shadow-lg border border-gray-200 font-medium transition-all hover:shadow-xl"
        >
          ← Upload Another File
        </Button>
      </div>
    </div>
  );
}
