import React from 'react';

function ConfirmationModal({ isOpen, title = 'Are you sure?', message, confirmLabel = 'Yes', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 id="confirmation-title" className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">No</button>
          <button type="button" onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
