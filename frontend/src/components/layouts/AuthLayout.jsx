import React from 'react';
import Logo from '../ui/Logo.jsx';

function AuthLayout({ children, title, subtitle, reverse = false }) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className={`mx-auto grid min-h-[calc(100vh-32px)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <section className="relative hidden min-h-[620px] bg-[#073ca6] p-10 text-white lg:block">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Logo dark />
            <div>
              <p className="mb-4 inline-flex rounded-md bg-white/10 px-3 py-1 text-xs font-bold">Academic workspace</p>
              <h1 className="max-w-md text-4xl font-black leading-tight">{title}</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">{subtitle}</p>
              <div className="mt-10 grid gap-4 rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="h-3 w-32 rounded-full bg-white/80" />
                <div className="h-3 w-56 rounded-full bg-white/50" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="h-20 rounded-md bg-white/15" />
                  <div className="h-20 rounded-md bg-white/25" />
                  <div className="h-20 rounded-md bg-teal-300/30" />
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-100">Plan tasks, share progress, and meet deadlines together.</p>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">{children}</section>
      </div>
    </main>
  );
}

export default AuthLayout;
