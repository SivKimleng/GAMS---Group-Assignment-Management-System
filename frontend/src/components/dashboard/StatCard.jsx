import React from 'react';

function StatCard({ label, value, detail, color }) {
  return (
    <article className="card p-4">
      <div className={`mb-4 h-1.5 w-12 rounded-full ${color}`} />
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <strong className="text-3xl font-black text-slate-950">{value}</strong>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{detail}</span>
      </div>
    </article>
  );
}

export default StatCard;
