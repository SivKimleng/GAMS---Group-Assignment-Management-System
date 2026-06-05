import React from 'react';

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#139f98]">{eyebrow}</p>}
      <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
    </div>
  );
}

export default SectionHeading;
