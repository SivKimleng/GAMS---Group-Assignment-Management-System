import React from 'react';

function DashboardPanel({ title, action, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        {action && <span className="text-xs font-bold text-[#073ca6]">{action}</span>}
      </div>
      {children}
    </section>
  );
}

export default DashboardPanel;
