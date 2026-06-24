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

const API_BASE = 'https://agentforge-t606.onrender.com';

const initialNodes = [
  {
    id: 'start-1',
    type: 'input',
    data: { label: 'Start Forge Workflow' },
    position: { x: 150, y: 200 },
    style: {
      background: '#18181b',
      color: '#fff',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
      padding: '10px'
    }
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

  // Fetch all agents
  const fetchAllAgentsList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/workflows`);
      if (res.data.success) setAllAgents(res.data.data || []);
    } catch (err) {
      console.log("Error loading agents list");
    }
  };

  // Load agent
  const loadSpecificAgent = async (agentId) => {
    if (!agentId) return;
    try {
      const res = await axios.get(`${API_BASE}/api/workflows/${agentId}`);
      if (res.data.success) {
        const agent = res.data.data;

        setCurrentAgentId(agent._id);
        setAgentName(agent.name);

        const hydratedNodes = (agent.nodes || []).map(node => ({
          ...node,
          data: { ...node.data, onChange: updateNodeDataField }
        }));

        setNodes(hydratedNodes);
        setEdges(agent.edges || []);
      }
    } catch (err) {
      alert("❌ Agent load failed");
    }
  };

  // Auto load latest
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/workflows/latest`);

        if (res.data.success && res.data.nodes?.length) {
          const resAll = await axios.get(`${API_BASE}/api/workflows`);

          if (resAll.data.data?.length) {
            const latest = resAll.data.data[0];
            setCurrentAgentId(latest._id);
            setAgentName(latest.name);
          }

          const hydrated = res.data.nodes.map(node => ({
            ...node,
            data: { ...node.data, onChange: updateNodeDataField }
          }));

          setNodes(hydrated);
          setEdges(res.data.edges || []);
        }

        fetchAllAgentsList();
      } catch (err) {
        fetchAllAgentsList();
      }
    };

    load();
  }, [updateNodeDataField, setNodes, setEdges]);

  // New agent
  const startNewAgent = () => {
    setCurrentAgentId(null);
    setAgentName(`AI Agent #${Math.floor(1000 + Math.random() * 9000)}`);
    setNodes(initialNodes);
    setEdges([]);
  };

  const clearCanvas = () => {
    if (window.confirm("Clear canvas?")) startNewAgent();
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 }
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // SAVE WORKFLOW
  const saveWorkflow = async () => {
    try {
      const workflowData = {
        id: currentAgentId,
        name: agentName,
        description: "AgentForge Workspace",
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
        edges
      };

      const res = await axios.post(
        `${API_BASE}/api/workflows`,
        workflowData
      );

      if (res.data.success) {
        alert("✅ Saved!");
        setCurrentAgentId(res.data.data._id);
        fetchAllAgentsList();
      }
    } catch (err) {
      alert("❌ Save failed");
    }
  };

  // RUN WORKFLOW
  const runWorkflow = async () => {
    try {
      if (nodes.length <= 1) {
        alert("Add AI node first");
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/ai/execute`,
        { nodes, edges }
      );

      if (res.data.success) {
        alert(res.data.output);
      }
    } catch (err) {
      alert("Execution failed");
    }
  };

  // DROP
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

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
          label: isTrigger ? 'Trigger' : 'AI Engine',
          modelName: 'gemini-2.5-flash',
          promptTemplate: '',
          triggerType: isTrigger ? 'webhook' : undefined,
          onChange: updateNodeDataField
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, updateNodeDataField]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950">

      {/* TOP BAR */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
        <h1 className="text-white font-bold">AgentForge</h1>

        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="bg-zinc-900 text-white px-2 py-1 rounded"
        />

        <div className="flex gap-2">
          <button onClick={clearCanvas}>Clear</button>
          <button onClick={startNewAgent}>New</button>
          <button onClick={runWorkflow}>Run</button>
          <button onClick={saveWorkflow}>Save</button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1">
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
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}