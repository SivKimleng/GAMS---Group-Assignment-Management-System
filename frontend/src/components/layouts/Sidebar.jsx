import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import { fallbackUser } from '../../utils/dataMappers.js';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Workspace', path: '/workspace', icon: 'folder' },
  { label: 'Timeline', path: '/timeline', icon: 'clock' }
];

const iconPaths = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  dashboard: (
    <>
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
      <path d="M3 10h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v5.5c0 4.4-2.8 7.7-8 9.5-5.2-1.8-8-5.1-8-9.5V6z" />
      <path d="M9 12.5 11 14.5 15.5 10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  logout: (
    <>
      <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10" />
      <path d="M14 8 18 12l-4 4" />
      <path d="M18 12H9" />
    </>
  )
};

export function SidebarIcon({ name, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${className}`}
    >
      {iconPaths[name]}
    </svg>
  );
}

function getNavClass(isActive, extra = '') {
  return `focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${extra} ${
    isActive
      ? 'bg-[#073ca6] text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;
}

function Sidebar({ user = fallbackUser, onLogout }) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <Logo />

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Signed in as</p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">{user.fullName}</p>
          {user.email && <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user.email}</p>}
        </div>

        <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-1 overflow-hidden" aria-label="Dashboard navigation">
          <Link
            to="/"
            className="focus-ring mb-2 flex min-h-12 items-center gap-3 rounded-lg border border-blue-100 bg-[#eef4ff] px-3 text-sm font-black text-[#073ca6] transition hover:border-[#073ca6] hover:bg-white"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[#073ca6] shadow-sm">
              <SidebarIcon name="home" />
            </span>
            <span className="min-w-0">
              <span className="block truncate">Landing Page</span>
              <span className="block truncate text-xs font-bold text-slate-500">Public site</span>
            </span>
          </Link>

          <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => getNavClass(isActive)}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-current/10">
                <SidebarIcon name={item.icon} />
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <Link to="/help-support" className="focus-ring mb-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#eef4ff] px-4 text-sm font-black text-[#073ca6]">
          Help &amp; Support
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#073ca6] bg-white px-4 text-sm font-black text-[#073ca6] transition hover:bg-[#eef4ff]"
        >
          <SidebarIcon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
