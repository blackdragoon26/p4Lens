import { useState } from "react";
import axios from "axios";
import PipelineFlow from "@/components/ui/PipelineFlow";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FiUpload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

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
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">P4₁₄</Badge>
            <Badge variant="secondary" className="text-xs">P4₁₆</Badge>
            <Badge variant="outline" className="text-xs">Interactive</Badge>
          </div>
        </div>
        
        <Card className="w-full max-w-2xl shadow-2xl bg-card/95 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl">
              Upload Your <span className="text-primary">P4 Program</span>
            </CardTitle>
            <CardDescription className="mt-3 text-base">
              Get comprehensive visualization of parser, control blocks, deparser, and all pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
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
                <div className="w-full border-2 border-dashed border-input hover:border-primary rounded-xl p-12 text-center hover:bg-accent/50 transition-all cursor-pointer group">
                  <div className="flex justify-center mb-4">
                    {file ? (
                      <FiCheckCircle className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                    ) : (
                      <FiUpload className="w-12 h-12 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {file ? file.name : "Click to select P4 file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file ? "Ready to analyze" : "or drag and drop your .p4 file here"}
                  </p>
                </div>
              </label>
            </div>
            <Button
              onClick={upload}
              disabled={loading || !file}
              size="lg"
              className="w-full text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing P4 Program...
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  Visualize Pipeline
                </>
              )}
            </Button>
            {error && (
              <Alert variant="destructive" className="w-full">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 text-center max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">📥</div>
                <div className="text-sm font-semibold text-foreground">Parser States</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">⚙️</div>
                <div className="text-sm font-semibold text-foreground">Control Blocks</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-semibold text-foreground">Tables & Actions</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm font-semibold text-foreground">Headers</div>
              </CardContent>
            </Card>
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
          variant="outline"
          className="bg-background/95 backdrop-blur-sm shadow-lg hover:shadow-xl"
        >
          ← Upload Another File
        </Button>
      </div>
    </div>
  );
}
