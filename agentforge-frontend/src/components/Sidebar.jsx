import React from 'react';
import { Zap, Bot } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-4 shrink-0">
      <div className="mb-2">
        <h3 className="text-xs font-bold text-zinc-505 uppercase tracking-wider text-zinc-400">
          Core Nodes
        </h3>
        <p className="text-[11px] text-zinc-600 mt-0.5">Drag tools onto the canvas matrix</p>
      </div>

      {/* 1. TRIGGER NODE OPTION */}
      <div
        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 cursor-grab hover:border-amber-500/50 transition-all group select-none active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'triggerNode')}
        draggable
      >
        <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-200">Execution Trigger</span>
          <span className="text-[10px] text-zinc-500">Webhook or Manual event</span>
        </div>
      </div>

      {/* 2. GEMINI AI NODE OPTION */}
      <div
        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 cursor-grab hover:border-violet-500/50 transition-all group select-none active:cursor-grabbing"
        onDragStart={(event) => onDragStart(event, 'aiNode')}
        draggable
      >
        <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
          <Bot className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-200">Gemini AI Engine</span>
          <span className="text-[10px] text-zinc-500">LLM Prompt Executor</span>
        </div>
      </div>
    </aside>
  );
}