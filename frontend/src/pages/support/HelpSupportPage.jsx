import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Button from '../../components/ui/Button.jsx';
import { clearSession, getSession } from '../../utils/authSession.js';
import { formatUser } from '../../utils/dataMappers.js';

const supportEmail = 'support@gams.local';
function HelpSupportPage() {
  const navigate = useNavigate(); const user = formatUser(getSession()?.user); const [notice, setNotice] = useState('');
  async function copy(value, label) { try { await navigator.clipboard.writeText(value); setNotice(`${label} copied.`); } catch { setNotice(`Copy this: ${value}`); } }
  return <div className="min-h-screen bg-[#f5f7fb] lg:flex"><Sidebar user={user} onLogout={() => { clearSession(); navigate('/'); }}/><main className="min-w-0 flex-1"><header className="border-b border-slate-200 bg-white"><div className="flex min-h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div><p className="text-xs font-black uppercase tracking-widest text-[#139f98]">Help &amp; Support</p><h1 className="text-xl font-black">Contact support</h1></div><Button to="/dashboard" variant="secondary">Dashboard</Button></div><MobileDashboardNav/></header><section className="mx-auto max-w-2xl px-4 py-10"><div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-2xl font-black">Need a hand?</h2><p className="mt-2 text-slate-600">Copy the support address and your logged-in email into your email app.</p>{notice && <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">{notice}</p>}<div className="mt-6 grid gap-4"><CopyRow label="Support email" value={supportEmail} onCopy={copy}/><CopyRow label="Your email" value={user.email || 'No email available'} onCopy={copy}/></div></div></section></main></div>;
}
function CopyRow({ label, value, onCopy }) { return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"><div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 break-all font-bold">{value}</p></div><button type="button" onClick={() => onCopy(value, label)} className="rounded-md bg-[#073ca6] px-3 py-2 text-sm font-black text-white">Copy</button></div>; }
export default HelpSupportPage;
