import React from 'react';
import { NavLink } from 'react-router-dom';

const mobileNavItems = [
  { label: 'Landing', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Workspace', path: '/workspace' },
  { label: 'Leader', path: '/leader' },
  { label: 'Timeline', path: '/timeline' }
];

function MobileDashboardNav() {
  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `shrink-0 rounded-md px-3 py-2 text-sm font-bold ${
                isActive
                  ? 'bg-[#073ca6] text-white'
                  : item.path === '/'
                    ? 'border border-blue-100 bg-[#eef4ff] text-[#073ca6]'
                    : 'bg-slate-100 text-slate-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileDashboardNav;
