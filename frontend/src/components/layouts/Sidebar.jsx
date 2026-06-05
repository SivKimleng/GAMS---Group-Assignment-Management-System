import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';
import { currentUser } from '../../data/mockData.js';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', mark: 'D' },
  { label: 'Workspace', path: '/workspace', mark: 'W' },
  { label: 'Leader Panel', path: '/leader', mark: 'L' },
  { label: 'Timeline', path: '/timeline', mark: 'T' }
];

function Sidebar({ user = currentUser, onLogout }) {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:flex-col">
      <Logo />
      <div className="mt-8 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-bold uppercase text-slate-500">Signed in as</p>
        <p className="mt-1 truncate text-sm font-black text-slate-900">{user.fullName}</p>
        {user.email && <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>}
      </div>
      <Link
        to="/"
        className="focus-ring mt-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-[#eef4ff] px-3 py-3 text-[#073ca6] transition hover:border-[#073ca6] hover:bg-white"
      >
        <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-sm font-black shadow-sm">
          G
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black">Landing Page</span>
          <span className="block truncate text-xs font-bold text-slate-500">Back to public site</span>
        </span>
      </Link>
      <nav className="mt-5 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition ${
                isActive
                  ? 'bg-[#073ca6] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`
            }
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white/20 text-xs">{item.mark}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Button type="button" variant="secondary" className="w-full" onClick={onLogout}>
        Logout
      </Button>
    </aside>
  );
}

export default Sidebar;
