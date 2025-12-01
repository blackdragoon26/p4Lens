import React, { useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
  FiLayers,
  FiX
} from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DEFAULT_CREATOR = {
  name: "Sankalp Jha",
  url: "https://sankalpjha.dev",
};

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
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connection Line */}
      {index < totalStages - 1 && (
        <div className="absolute left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-blue-300 to-blue-200 transform -translate-x-1/2 z-0">
          <Motion.div
            className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"
            animate={{ y: [0, 60, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      <Motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "relative bg-card rounded-2xl border-2 shadow-lg cursor-pointer transition-all duration-300",
          config.border,
          isActive && "ring-4 ring-primary ring-offset-2"
        )}
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
          <div className="flex flex-wrap justify-center gap-2">
            {stage.stats.tables > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {stage.stats.tables} {stage.stats.tables === 1 ? 'Table' : 'Tables'}
              </Badge>
            )}
            {stage.stats.actions > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {stage.stats.actions} {stage.stats.actions === 1 ? 'Action' : 'Actions'}
              </Badge>
            )}
            {stage.stats.states > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {stage.stats.states} {stage.stats.states === 1 ? 'State' : 'States'}
              </Badge>
            )}
          </div>
    </div>
      </Motion.div>
    </Motion.div>
  );
}

export default function PipelineFlow({ structure, creator = DEFAULT_CREATOR }) {
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  const globalTables = structure?._tables || {};
  const globalHeaders = structure?._headers || {};

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
    <div className="w-screen h-screen relative bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">P4Lens</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setViewMode("pipeline");
                  setSelected(null);
                }}
                variant={viewMode === "pipeline" ? "default" : "outline"}
                size="sm"
              >
                Pipeline View
              </Button>
              <Button
                onClick={() => {
                  setViewMode("overview");
                  setSelected(null);
                }}
                variant={viewMode === "overview" ? "default" : "outline"}
                size="sm"
              >
                Overview
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Built by{" "}
              <a
                href={creator?.url || DEFAULT_CREATOR.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                {creator?.name || DEFAULT_CREATOR.name}
              </a>
            </div>
            <Badge variant="outline" className="text-sm">
              {structure._filename || "P4 Program"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 h-full overflow-y-auto">
        {viewMode === "pipeline" && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">P4 Pipeline Flow</h2>
              <p className="text-muted-foreground">Click on any stage to explore its details</p>
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
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Comprehensive Detailed Panel Component
function DetailedPanel({ stage, globalTables, globalHeaders, onClose }) {
  const [activeTab, setActiveTab] = useState("deep-dive");

  const info = stage.info;
  const applyLogic = info.apply_logic || {};
  const tables = info.tables || [];
  const actions = info.actions || [];
  const states = info.states || [];
  const extracts = info.extracts || [];
  const transitions = info.transitions || [];

  return (
    <Motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-20 bottom-0 w-[600px] z-40 bg-background shadow-2xl border-l border-border overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{stage.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                {info.type}
              </Badge>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-border bg-muted/30">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deep-dive">Deep Dive</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="deep-dive" className="mt-0">
              <DeepDiveTab
                info={info}
                states={states}
                extracts={extracts}
                transitions={transitions}
                applyLogic={applyLogic}
                globalHeaders={globalHeaders}
              />
            </TabsContent>
            <TabsContent value="tables" className="mt-0">
              <TablesTabDetailed tables={tables} globalTables={globalTables} />
            </TabsContent>
            <TabsContent value="actions" className="mt-0">
              <ActionsTabDetailed actions={actions} />
            </TabsContent>
            <TabsContent value="flow" className="mt-0">
              <FlowTab applyLogic={applyLogic} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </Motion.div>
  );
}

// Deep Dive Tab - Comprehensive Explanation
function DeepDiveTab({ info, states, extracts, transitions, applyLogic, globalHeaders }) {
  const type = info.type;

  return (
    <div className="space-y-6">
      {/* What is this stage? */}
      <Motion.div
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
      </Motion.div>

      {/* Parser-specific details */}
      {type === "parser" && states && states.length > 0 && (
        <Motion.div
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
        </Motion.div>
      )}

      {/* Control-specific details */}
      {type === "control" && applyLogic && applyLogic.raw_apply_body && (
        <Motion.div
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
        </Motion.div>
      )}

      {/* Headers Reference */}
      {Object.keys(globalHeaders).length > 0 && (
        <Motion.div
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
        </Motion.div>
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
          <Motion.div
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
          </Motion.div>
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
        <Motion.div
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
        </Motion.div>
      ))}
    </div>
  );
}

// Flow Tab
function FlowTab({ applyLogic }) {
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
function OverviewView({ pipelineStages, globalTables, globalHeaders }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Program Overview</h2>
        <p className="text-gray-600">Complete P4 Pipeline Analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-blue-600">{pipelineStages.length}</div>
          <div className="text-sm text-gray-600 mt-2">Pipeline Stages</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-emerald-600">{Object.keys(globalTables).length}</div>
          <div className="text-sm text-gray-600 mt-2">Match-Action Tables</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-purple-600">{Object.keys(globalHeaders).length}</div>
          <div className="text-sm text-gray-600 mt-2">Header Types</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="text-3xl font-bold text-orange-600">
            {pipelineStages.reduce((sum, s) => sum + (s.stats.actions || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 mt-2">Total Actions</div>
        </Motion.div>
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
