import React from 'react';

function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={`focus-ring h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export default InputField;
