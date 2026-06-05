import React from 'react';

function FeatureCard({ icon, title, description }) {
  return (
    <article className="card p-5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-[#eef4ff] text-lg font-black text-[#073ca6]">
        {icon}
      </div>
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

export default FeatureCard;
