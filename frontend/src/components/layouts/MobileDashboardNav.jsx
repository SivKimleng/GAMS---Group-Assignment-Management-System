import React from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarIcon } from './Sidebar.jsx';

const mobileNavItems = [
  { label: 'Landing', path: '/', icon: 'home' },
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Workspace', path: '/workspace', icon: 'folder' },
  { label: 'Leader', path: '/leader', icon: 'shield' },
  { label: 'Timeline', path: '/timeline', icon: 'clock' }
];

function MobileDashboardNav() {
  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Mobile dashboard navigation">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-[#073ca6] text-white'
                  : item.path === '/'
                    ? 'border border-blue-100 bg-[#eef4ff] text-[#073ca6]'
                    : 'bg-slate-100 text-slate-600'
              }`
            }
          >
            <SidebarIcon name={item.icon} className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileDashboardNav;
