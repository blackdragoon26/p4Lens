import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiPackage, 
  FiSettings, 
  FiSend,
  FiFileText,
  FiDatabase,
  FiCode,
  FiZap,
  FiLayers
} from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Pipeline Stage Card Component
function PipelineStageCard({ stage, index, isActive, onClick, totalStages }) {
  const stageConfig = {
    parser: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-900",
      icon: FiPackage,
      label: "Parser",
    },
    control: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-900",
      icon: FiSettings,
      label: "Control",
    },
      deparser: {
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-900",
      icon: FiSend,
      label: "Deparser",
    },
  };

  const config = stageConfig[stage.type] || {
    gradient: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-900",
    icon: FiCode,
    label: stage.type,
  };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connection Line */}
      {index < totalStages - 1 && (
        <div className="absolute left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-blue-300 to-blue-200 transform -translate-x-1/2 z-0">
          <motion.div
            className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"
            animate={{ y: [0, 60, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative bg-white rounded-2xl border-2 ${config.border} shadow-lg cursor-pointer
          transition-all duration-300 ${isActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90 uppercase tracking-wide font-semibold">
                  {config.label}
                </div>
                <div className="text-2xl font-bold mt-1">{stage.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold opacity-20">#{index + 1}</div>
            </div>
          </div>
      </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {stage.stats.tables > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stage.stats.tables}</div>
                <div className="text-xs text-gray-500 mt-1">Tables</div>
              </div>
            )}
            {stage.stats.actions > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stage.stats.actions}</div>
                <div className="text-xs text-gray-500 mt-1">Actions</div>
              </div>
            )}
            {stage.stats.states > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stage.stats.states}</div>
                <div className="text-xs text-gray-500 mt-1">States</div>
              </div>
            )}
          </div>
    </div>
      </motion.div>
    </motion.div>
  );
}

export default function PipelineFlow({ structure }) {
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  const globalTables = structure?._tables || {};
  const globalHeaders = structure?._headers || {};
  const globalExterns = structure?._externs || {};

  // Organize pipeline stages
  const pipelineStages = useMemo(() => {
    if (!structure) return [];

    const nodeKeys = Object.keys(structure).filter((k) => !k.startsWith("_"));
    const sortedKeys = nodeKeys.sort((a, b) => {
      const order = { parser: 0, control: 1, deparser: 2 };
      const typeA = structure[a].type;
      const typeB = structure[b].type;
      return (order[typeA] || 99) - (order[typeB] || 99);
    });

    return sortedKeys.map((name, index) => {
      const info = structure[name];
      const tables = info.tables || [];
      const actions = info.actions || [];
      const states = info.states || [];

      return {
        id: name,
        name,
        info,
          type: info.type,
        index,
        stats: {
          tables: tables.length,
          actions: Array.isArray(actions) ? actions.length : 0,
          states: Array.isArray(states) ? states.length : 0,
        },
      };
    });
  }, [structure]);

  if (!structure || pipelineStages.length === 0) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-400">
        Upload a P4 file to visualize.
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">P4Lens</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode("pipeline");
                  setSelected(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === "pipeline"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pipeline View
              </button>
              <button
                onClick={() => {
                  setViewMode("overview");
                  setSelected(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === "overview"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Overview
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {structure._filename || "P4 Program"}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 h-full overflow-y-auto">
        {viewMode === "pipeline" && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">P4 Pipeline Flow</h2>
              <p className="text-gray-600">Click on any stage to explore its details</p>
            </div>

            <div className="space-y-8">
              {pipelineStages.map((stage, index) => (
                <PipelineStageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  totalStages={pipelineStages.length}
                  isActive={selected?.id === stage.id}
                  onClick={() => setSelected(stage)}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === "overview" && (
          <OverviewView
            structure={structure}
            pipelineStages={pipelineStages}
            globalTables={globalTables}
            globalHeaders={globalHeaders}
          />
        )}
      </div>

      {/* Detailed Side Panel */}
      <AnimatePresence>
        {selected && viewMode === "pipeline" && (
          <DetailedPanel
            stage={selected}
            globalTables={globalTables}
            globalHeaders={globalHeaders}
            globalExterns={globalExterns}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Comprehensive Detailed Panel Component
function DetailedPanel({ stage, globalTables, globalHeaders, globalExterns, onClose }) {
  const [activeTab, setActiveTab] = useState("deep-dive");

  const info = stage.info;
  const applyLogic = info.apply_logic || {};
  const tables = info.tables || [];
  const actions = info.actions || [];
  const states = info.states || [];
  const extracts = info.extracts || [];
  const transitions = info.transitions || [];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-20 bottom-0 w-[600px] z-40 bg-white shadow-2xl border-l border-gray-200 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{stage.name}</h2>
            <div className="text-sm opacity-80 uppercase tracking-wide">{info.type}</div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {["deep-dive", "tables", "actions", "flow"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {tab === "deep-dive" ? "Deep Dive" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "deep-dive" && (
          <DeepDiveTab
            info={info}
            states={states}
            extracts={extracts}
            transitions={transitions}
            applyLogic={applyLogic}
            globalHeaders={globalHeaders}
          />
        )}
        {activeTab === "tables" && (
          <TablesTabDetailed tables={tables} globalTables={globalTables} />
        )}
        {activeTab === "actions" && (
          <ActionsTabDetailed actions={actions} />
        )}
        {activeTab === "flow" && (
          <FlowTab applyLogic={applyLogic} tables={tables} globalTables={globalTables} />
        )}
      </div>
    </motion.div>
  );
}

// Deep Dive Tab - Comprehensive Explanation
function DeepDiveTab({ info, states, extracts, transitions, applyLogic, globalHeaders }) {
  const type = info.type;

  return (
    <div className="space-y-6">
      {/* What is this stage? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg"
      >
        <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2">
          <FiFileText className="w-5 h-5" />
          What is {type}?
        </h3>
        {type === "parser" && (
          <p className="text-blue-800 text-sm leading-relaxed">
            The <strong>Parser</strong> is the first stage in P4 packet processing. It reads incoming packet bits
            sequentially and extracts headers based on the packet structure. Think of it as a "packet decoder" that
            identifies what type of packet it is (Ethernet, IPv4, TCP, etc.) and extracts the relevant header fields.
            The parser uses a state machine to navigate through different header types.
          </p>
        )}
        {type === "control" && (
          <p className="text-blue-800 text-sm leading-relaxed">
            The <strong>Control</strong> block is the "brain" of P4 processing. It contains match-action tables that
            make forwarding decisions. When a packet arrives, the control block examines header fields, matches them
            against table entries, and executes corresponding actions (like forwarding, dropping, or modifying headers).
            The <code className="bg-blue-100 px-1 rounded">apply</code> block is the main function that orchestrates
            which tables to apply and in what order.
          </p>
        )}
        {type === "deparser" && (
          <p className="text-blue-800 text-sm leading-relaxed">
            The <strong>Deparser</strong> is the final stage that reassembles the packet. After all processing is done,
            it takes the modified headers and serializes them back into a packet format. It emits headers in the correct
            order, ensuring the packet is properly formatted before being sent out.
          </p>
        )}
      </motion.div>

      {/* Parser-specific details */}
      {type === "parser" && states && states.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-5"
        >
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <FiLayers className="w-5 h-5" />
            Parser State Machine
          </h3>
          <div className="space-y-3">
            {states.map((state, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-800 mb-2">{state}</div>
                {extracts[i] && (
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">Extracts:</span>{" "}
                    <code className="bg-slate-100 px-2 py-0.5 rounded">{extracts[i]}</code>
                  </div>
                )}
                {transitions[i] && transitions[i] !== "select" && transitions[i] !== "accept" && (
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">Transitions to:</span>{" "}
                    <span className="text-blue-600">{transitions[i]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Control-specific details */}
      {type === "control" && applyLogic && applyLogic.raw_apply_body && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-5"
        >
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <FiCode className="w-5 h-5" />
            Apply Block - Main Function
          </h3>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{applyLogic.raw_apply_body}</pre>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-900">
              <strong>💡 Understanding Apply Blocks:</strong> The <code>apply</code> block is like the <code>main()</code> function
              in traditional programming. It defines the execution flow - which tables to apply and under what conditions.
            </p>
          </div>
        </motion.div>
      )}

      {/* Headers Reference */}
      {Object.keys(globalHeaders).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-5"
        >
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <FiDatabase className="w-5 h-5" />
            Available Headers
          </h3>
          <div className="space-y-3">
            {Object.entries(globalHeaders).map(([name, fields]) => (
              <div key={name} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-800 mb-2">{name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {fields.map((field, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="text-slate-600">{field.field}</span>
                      <span className="text-slate-400">({field.bits})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Detailed Tables Tab
function TablesTabDetailed({ tables, globalTables }) {
  if (tables.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiDatabase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No tables in this control block</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tables.map((tableName, i) => {
        const table = globalTables[tableName];
        if (!table) return null;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-900">{tableName}</h3>
              {table.size && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Max {table.size} entries
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FiZap className="w-4 h-4" />
                  Match Keys
                </h4>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  {table.keys.map((key, ki) => (
                    <div key={ki} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <code className="text-sm text-slate-700 flex-1">{key}</code>
                    </div>
                  ))}
                </div>
              </div>

                <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FiZap className="w-4 h-4" />
                  Available Actions
                </h4>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {table.actions.map((action, ai) => (
                      <span
                        key={ai}
                        className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-semibold"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Detailed Actions Tab
function ActionsTabDetailed({ actions }) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiSettings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No actions defined in this block</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actions.map((action, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-purple-900 mb-4">{action.name || action}</h3>

          {typeof action === "object" && (
            <div className="space-y-4">
              {action.parameters && action.parameters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">📥 Parameters</h4>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    {action.parameters.map((param, pi) => (
                      <div key={pi} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                        <code className="text-sm text-slate-700">
                          {param.type} <span className="font-semibold">{param.name}</span>
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {action.body_preview && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">📝 Implementation</h4>
                  <pre className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    {action.body_preview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Flow Tab
function FlowTab({ applyLogic, tables, globalTables }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-5 rounded-lg">
        <h3 className="font-bold text-lg text-emerald-900 mb-2">🔄 Execution Flow</h3>
        <p className="text-emerald-800 text-sm">
          This shows the order in which tables are applied and how packet processing flows.
        </p>
      </div>

      {applyLogic.logic && applyLogic.logic.length > 0 ? (
        <div className="space-y-4">
          {applyLogic.logic.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                <code className="text-sm text-slate-700">{step}</code>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No explicit flow logic defined</p>
        </div>
      )}
    </div>
  );
}

// Overview View
function OverviewView({ structure, pipelineStages, globalTables, globalHeaders }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Program Overview</h2>
        <p className="text-gray-600">Complete P4 Pipeline Analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-blue-600">{pipelineStages.length}</div>
          <div className="text-sm text-gray-600 mt-2">Pipeline Stages</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-emerald-600">{Object.keys(globalTables).length}</div>
          <div className="text-sm text-gray-600 mt-2">Match-Action Tables</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-purple-600">{Object.keys(globalHeaders).length}</div>
          <div className="text-sm text-gray-600 mt-2">Header Types</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-orange-600">
            {pipelineStages.reduce((sum, s) => sum + (s.stats.actions || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 mt-2">Total Actions</div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="font-bold text-lg text-slate-900 mb-4">🔄 Pipeline Flow</h3>
        <div className="space-y-3">
          {pipelineStages.map((stage, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{stage.name}</div>
                <div className="text-xs text-gray-600 uppercase">{stage.type}</div>
              </div>
              <div className="text-2xl">{i < pipelineStages.length - 1 ? "→" : "✓"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
