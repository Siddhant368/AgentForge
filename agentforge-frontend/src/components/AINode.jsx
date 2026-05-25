import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function AINode({ id, data }) {
  return (
    <div className="bg-zinc-900/90 backdrop-blur-xl border border-violet-500/40 shadow-2xl shadow-violet-500/10 rounded-xl p-4 w-64 text-zinc-200 transition-all hover:border-violet-400 group">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-zinc-950 border-2 border-violet-500 rounded-full !left-[-7px] transition-all group-hover:scale-125"
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
        <span className="text-violet-400 text-lg animate-pulse">🤖</span>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">AI Engine</h3>
          <p className="text-[10px] text-zinc-500 font-mono">{id}</p>
        </div>
      </div>

      {/* Model Selection Dropdown */}
      <div className="mb-3">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">Model Name</label>
        <select
          value={data.modelName || 'gemini-2.5-flash'}
          onChange={(e) => data.onChange(id, 'modelName', e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer transition-all"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro (Heavy)</option>
        </select>
      </div>

      {/* Prompt Textarea */}
      <div>
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">System Prompt</label>
        <textarea
          rows={3}
          value={data.promptTemplate || ''}
          onChange={(e) => data.onChange(id, 'promptTemplate', e.target.value)}
          placeholder="Ask Gemini anything..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 placeholder-zinc-600 resize-none font-mono"
        />
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-zinc-950 border-2 border-violet-500 rounded-full !right-[-7px] transition-all group-hover:scale-125"
      />
    </div>
  );
}