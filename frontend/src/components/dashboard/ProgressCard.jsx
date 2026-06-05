import React from 'react';

function ProgressCard({ title, value, description, color = 'bg-[#073ca6]' }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <span className="text-sm font-black text-slate-700">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}

export default ProgressCard;
