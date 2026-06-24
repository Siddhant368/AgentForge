import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import AINode from './components/AINode'; 
import TriggerNode from './components/TriggerNode';

const initialNodes = [
  {
    id: 'start-1',
    type: 'input',
    data: { label: 'Start Forge Workflow' },
    position: { x: 150, y: 200 },
    style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px' }
  },
];

export default function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [allAgents, setAllAgents] = useState([]);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [agentName, setAgentName] = useState("My First AI Agent");

  const nodeTypes = useMemo(() => ({
    aiNode: AINode,
    triggerNode: TriggerNode,
  }), []);

  const updateNodeDataField = useCallback((nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, [field]: value },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const fetchAllAgentsList = async () => {
    try {
      const response = await axios.get('https://agentforge-t606.onrender.com/api/workflows');
      if (response.data.success) {
        setAllAgents(response.data.data || []);
      }
    } catch (error) {
      console.log("Error loading agents list");
    }
  };

  const loadSpecificAgent = async (agentId) => {
    if (!agentId) return;
    try {
      const response = await axios.get(`https://agentforge-t606.onrender.com/api/workflows/${agentId}`);
      if (response.data.success && response.data.data) {
        const agent = response.data.data;
        setCurrentAgentId(agent._id);
        setAgentName(agent.name);
        
        const hydratedNodes = (agent.nodes || []).map(node => ({
          ...node,
          data: { ...node.data, onChange: updateNodeDataField }
        }));
        
        setNodes(hydratedNodes);
        setEdges(agent.edges || []);
      }
    } catch (error) {
      alert("❌ Agent load karne me dikkat aayi");
    }
  };

  useEffect(() => {
    const loadLatestSession = async () => {
      try {
        const response = await axios.get('https://agentforge-t606.onrender.com/api/workflows/latest');
        if (response.data.success && response.data.nodes && response.data.nodes.length > 0) {
          const responseAll = await axios.get('https://agentforge-t606.onrender.com/api/workflows');
          if(responseAll.data.data.length > 0) {
            const latest = responseAll.data.data[0];
            setCurrentAgentId(latest._id);
            setAgentName(latest.name);
          }

          const hydratedNodes = response.data.nodes.map(node => ({
            ...node,
            data: { ...node.data, onChange: updateNodeDataField }
          }));
          setNodes(hydratedNodes);
          setEdges(response.data.edges || []);
        }
        fetchAllAgentsList();
      } catch (error) {
        fetchAllAgentsList();
      }
    };
    loadLatestSession();
  }, [updateNodeDataField, setNodes, setEdges]);

  const startNewAgent = () => {
    setCurrentAgentId(null);
    setAgentName(`AI Agent #${Math.floor(1000 + Math.random() * 9000)}`);
    setNodes(initialNodes);
    setEdges([]);
  };

  const clearCanvas = () => {
    if (window.confirm("⚠️ Kya aap pure canvas ko clear karke fresh start karna chahte hain?")) {
      startNewAgent();
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const saveWorkflow = async () => {
    try {
      const workflowData = {
        id: currentAgentId,
        name: agentName,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label,
            modelName: node.data.modelName,
            promptTemplate: node.data.promptTemplate,
            triggerType: node.data.triggerType
          }
        })),
        edges: edges
      };

      const response = await axios.post('https://agentforge-t606.onrender.com/api/workflows', workflowData);
      if (response.data.success) {
        alert('🎉 Agent Workspace safely saved!');
        setCurrentAgentId(response.data.data._id);
        fetchAllAgentsList();
      }
    } catch (error) {
      alert('❌ Workflow save nahi ho paya.');
    }
  };

  const runWorkflow = async () => {
    try {
      if (nodes.length <= 1) {
        alert("⚠️ Pehle canvas par Gemini AI Engine node toh add karo!");
        return;
      }
      alert("⚡ AI Agent execution shuru ho rahi hai...");
      const response = await axios.post('https://agentforge-t606.onrender.com/api/ai/execute', { nodes, edges });
      if (response.data.success) {
        alert(`🤖 AI Response:\n\n${response.data.output}`);
      }
    } catch (error) {
      alert("❌ Backend execution error.");
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const isTrigger = type === 'triggerNode';
      
      const newNode = {
        id: `node_${Math.random().toString(36).substr(2, 9)}`,
        type,
        position,
        data: { 
          label: isTrigger ? 'Execution Trigger' : 'Gemini AI Engine',
          modelName: isTrigger ? undefined : 'gemini-2.5-flash',
          promptTemplate: isTrigger ? undefined : '',
          triggerType: isTrigger ? 'webhook' : undefined,
          onChange: updateNodeDataField
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, updateNodeDataField]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 font-sans overflow-hidden">
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h1 className="text-md font-bold tracking-wider text-zinc-100">AgentForge</h1>
          </div>
          <input 
            type="text" 
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="bg-zinc-950/60 border border-zinc-800 px-3 py-1 text-xs text-zinc-200 rounded-lg focus:outline-none focus:border-violet-500 font-medium w-48"
          />
          <select
            value={currentAgentId || ''}
            onChange={(e) => loadSpecificAgent(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="" disabled>Select an Agent...</option>
            {allAgents.map((agent) => (
              <option key={agent._id} value={agent._id}>{agent.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={clearCanvas} className="border border-red-900/60 hover:bg-red-950/40 text-red-400 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all active:scale-95">🗑️ Clear Canvas</button>
          <button onClick={startNewAgent} className="border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all active:scale-95">➕ New Agent</button>
          <button onClick={runWorkflow} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-100 text-xs font-semibold py-2 px-4 rounded-lg shadow-lg cursor-pointer active:scale-95 transition-all">🚀 Run Agent</button>
          <button onClick={saveWorkflow} className="bg-violet-600 hover:bg-violet-500 text-zinc-100 text-xs font-semibold py-2 px-4 rounded-lg shadow-lg cursor-pointer active:scale-95 transition-all">Save Agent</button>
        </div>
      </header>

      {/* Main Workspace - Yahan fix kiya gaya hai */}
      <div className="flex flex-1 w-full overflow-hidden" ref={reactFlowWrapper} style={{ height: 'calc(100vh - 56px)' }}>
        <Sidebar />
        <div className="flex-1 h-full w-full relative bg-zinc-950">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              deleteKeyCode={["Delete", "Backspace"]}
              fitView
            >
              <Background color="#27272a" variant="dots" gap={16} size={1} />
              <Controls className="bg-zinc-900 border border-zinc-800 text-white fill-white" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}