import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Benefits', href: '#benefits' }
];

function Navbar({ isAuthenticated = false }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="page-container flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#073ca6]">
              {link.label}
            </a>
          ))}
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className="hover:text-[#073ca6]">
                Dashboard
              </NavLink>
              <NavLink to="/workspace" className="hover:text-[#073ca6]">
                Workspace
              </NavLink>
              <NavLink to="/leader" className="hover:text-[#073ca6]">
                Leader
              </NavLink>
              <NavLink to="/timeline" className="hover:text-[#073ca6]">
                Timeline
              </NavLink>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button to="/workspace" variant="secondary" className="hidden min-h-10 px-4 sm:inline-flex">
                Open Workspace
              </Button>
              <Button to="/dashboard" className="min-h-10 px-4">
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="secondary" className="hidden min-h-10 px-4 sm:inline-flex">
                Login
              </Button>
              <Button to="/signup" className="min-h-10 px-4">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
