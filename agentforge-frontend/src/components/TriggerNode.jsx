import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function TriggerNode({ id, data }) {
  return (
    <div className="bg-zinc-900/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-amber-500/10 rounded-xl p-4 w-60 text-zinc-200 transition-all hover:border-amber-400 group">
      
      {/* Node Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
        <span className="text-amber-400 text-lg">⚡</span>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Execution Trigger</h3>
          <p className="text-[10px] text-zinc-500 font-mono">{id}</p>
        </div>
      </div>

      {/* Trigger Type Dropdown */}
      <div className="mb-2">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">Trigger Type</label>
        <select
          value={data.triggerType || 'webhook'}
          onChange={(e) => data.onChange(id, 'triggerType', e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer transition-all"
        >
          <option value="webhook">Webhook URL</option>
          <option value="manual">Manual Click</option>
        </select>
      </div>

      {/* Dynamic Info Field */}
      {data.triggerType === 'webhook' ? (
        <div className="mt-2 bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 font-mono text-[10px] text-amber-500/80 break-all select-all">
          GET /api/v1/trigger/{id.substring(5, 11)}
        </div>
      ) : (
        <p className="text-[10px] text-zinc-500 italic mt-1 px-1">Runs immediately via Run Agent button.</p>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-zinc-950 border-2 border-amber-500 rounded-full !right-[-7px] transition-all group-hover:scale-125"
      />
    </div>
  );
}