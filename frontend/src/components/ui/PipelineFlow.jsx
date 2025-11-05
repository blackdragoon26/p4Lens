import React, { useMemo, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ---------- Node renderer ----------
function NodeComponent({ data }) {
  const colorMap = {
    parser: { bg: "from-blue-500 to-blue-700", border: "border-blue-400" },
    control: { bg: "from-emerald-500 to-emerald-700", border: "border-emerald-400" },
    deparser: { bg: "from-orange-500 to-orange-700", border: "border-orange-400" },
    default: { bg: "from-slate-500 to-slate-700", border: "border-slate-400" },
  };
  const color = colorMap[data.type] || colorMap.default;

  // Count badges
  const b = data.badges || { tables: 0, headers: 0, externs: 0 };

  return (
    <div
      className={`rounded-2xl border ${color.border} bg-gradient-to-br ${color.bg}
        shadow-lg p-5 text-white w-[260px] text-center cursor-pointer hover:scale-[1.03] transition-transform`}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Top} className="bg-white/70" />
      <div className="font-bold text-lg mb-1">{data.label}</div>
      <div className="text-xs opacity-80 mb-3">{data.type}</div>

      {/* small inline badges */}
      <div className="flex justify-center gap-3 text-xs">
        <span className="bg-white/20 rounded px-2 py-0.5">Tables {b.tables}</span>
        <span className="bg-white/20 rounded px-2 py-0.5">Headers {b.headers}</span>
        <span className="bg-white/20 rounded px-2 py-0.5">Externs {b.externs}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-white/70" />
    </div>
  );
}

// keep nodeTypes stable
const nodeTypes = { custom: NodeComponent };

// ---------- Main Flow ----------
export default function PipelineFlow({ structure }) {
  const [selected, setSelected] = useState(null);

  if (!structure || Object.keys(structure).length === 0)
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-slate-900 text-gray-400">
        Upload a P4 file to visualize.
      </div>
    );

  const globalTables = structure._tables || {};
  const globalHeaders = structure._headers || {};
  const globalExterns = structure._externs || [];

  const { nodes, edges } = useMemo(() => {
    const nodeKeys = Object.keys(structure).filter((k) => !k.startsWith("_"));
    const builtNodes = nodeKeys.map((name, i) => {
      const info = structure[name];

      const badgeCounts = {
        tables: (info.tables || []).length,
        headers: Object.keys(globalHeaders).length,
        externs: globalExterns.length,
      };

      return {
        id: name,
        type: "custom",
        data: {
          label: name,
          type: info.type,
          badges: badgeCounts,
          onClick: () => setSelected({ name, info }),
        },
        position: { x: 0, y: i * 320 },
      };
    });

    const builtEdges = nodeKeys.slice(0, -1).map((n, i) => ({
      id: `e-${n}-${nodeKeys[i + 1]}`,
      source: nodeKeys[i],
      target: nodeKeys[i + 1],
      animated: true,
      style: { stroke: "#38bdf8", strokeWidth: 3 },
      type: "smoothstep",
    }));

    return { nodes: builtNodes, edges: builtEdges };
  }, [structure]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 100%)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          zoomable
          pannable
          maskColor="#0f172a"
          nodeColor={(n) => {
            if (n.data.type === "parser") return "#3b82f6";
            if (n.data.type === "control") return "#10b981";
            if (n.data.type === "deparser") return "#fb923c";
            return "#64748b";
          }}
        />
        <Controls className="bg-slate-900/80 text-white rounded-md shadow-lg" />
        <Background color="#334155" gap={18} size={1} variant="dots" />
      </ReactFlow>

      {/* floating detail panel */}
      {selected && (
        <div className="absolute right-4 top-4 w-[400px] z-50">
          <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">
                {selected.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Type</h3>
                <p>{selected.info.type}</p>
              </div>

              {selected.info.tables?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Tables ({selected.info.tables.length})
                  </h3>
                  <ul className="list-disc ml-5">
                    {selected.info.tables.map((t, i) => (
                      <li key={i}>
                        <span className="font-medium text-blue-600">{t}</span>
                        {globalTables[t] && (
                          <ul className="ml-4 list-none text-xs">
                            {globalTables[t].keys.map((k, ki) => (
                              <li key={ki}>🔹 {k}</li>
                            ))}
                            {globalTables[t].actions.map((a, ai) => (
                              <li key={ai}>⚙️ {a}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(globalHeaders).length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Headers</h3>
                  <ul className="list-disc ml-5">
                    {Object.keys(globalHeaders).map((h, i) => (
                      <li key={i}>
                        <span className="font-medium text-emerald-600">{h}</span>
                        <ul className="ml-4 list-none text-xs">
                          {globalHeaders[h].map((f, fi) => (
                            <li key={fi}>
                              • {f.field}: {f.bits} bits
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {globalExterns.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Externs ({globalExterns.length})
                  </h3>
                  <ul className="list-disc ml-5">
                    {globalExterns.map((e, i) => (
                      <li key={i}>
                        {e.type} → <span className="font-medium">{e.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded-md hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
