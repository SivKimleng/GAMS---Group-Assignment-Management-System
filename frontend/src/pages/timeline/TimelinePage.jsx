import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import { currentUser, timelineEvents } from '../../data/mockData.js';
import { clearMockSession, getMockSession } from '../../utils/mockAuth.js';

const typeStyles = {
  Milestone: 'bg-blue-100 text-blue-700',
  Deadline: 'bg-red-100 text-red-700',
  Presentation: 'bg-purple-100 text-purple-700',
  Meeting: 'bg-teal-100 text-teal-700'
};

function TimelinePage() {
  const navigate = useNavigate();
  const session = getMockSession();
  const user = session?.user || currentUser;
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedEventTitle, setSelectedEventTitle] = useState(timelineEvents[0].title);

  const visibleEvents = useMemo(() => {
    if (typeFilter === 'All') return timelineEvents;
    return timelineEvents.filter((event) => event.type === typeFilter);
  }, [typeFilter]);

  const selectedEvent =
    timelineEvents.find((event) => event.title === selectedEventTitle) || visibleEvents[0] || timelineEvents[0];

  const eventTypes = ['All', ...new Set(timelineEvents.map((event) => event.type))];

  function handleLogout() {
    clearMockSession();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#139f98]">Timeline</p>
              <h1 className="text-xl font-black text-slate-950">Assignment Timeline</h1>
            </div>
            <Button to="/leader" variant="secondary" className="min-h-10 px-4">
              Leader Panel
            </Button>
          </div>
          <MobileDashboardNav />
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#139f98]">March 2026 plan preview</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Track milestones from proposal to final rehearsal.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Timeline events are mock data, but filtering and event selection are fully handled in React state.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`rounded-md px-3 py-2 text-sm font-bold ${
                      typeFilter === type ? 'bg-[#073ca6] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <DashboardPanel title="Timeline Events" action={`${visibleEvents.length} shown`}>
              <div className="relative grid gap-4">
                <div className="absolute bottom-4 left-[18px] top-4 hidden w-0.5 bg-slate-200 sm:block" />
                {visibleEvents.map((event) => (
                  <button
                    key={event.title}
                    type="button"
                    onClick={() => setSelectedEventTitle(event.title)}
                    className={`relative rounded-lg border p-4 text-left transition ${
                      selectedEvent.title === event.title
                        ? 'border-[#073ca6] bg-[#eef4ff]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="sm:pl-9">
                        <span className="absolute left-3 top-5 hidden h-3 w-3 rounded-full bg-[#073ca6] ring-4 ring-white sm:block" />
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{event.date}</p>
                        <h3 className="mt-1 font-black text-slate-950">{event.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{event.group}</p>
                      </div>
                      <span className={`w-fit rounded-md px-2 py-1 text-xs font-black ${typeStyles[event.type]}`}>
                        {event.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </DashboardPanel>

            <div className="grid gap-6">
              <DashboardPanel title="Selected Event" action={selectedEvent.date}>
                <span className={`mb-4 inline-flex rounded-md px-2 py-1 text-xs font-black ${typeStyles[selectedEvent.type]}`}>
                  {selectedEvent.type}
                </span>
                <h3 className="text-xl font-black text-slate-950">{selectedEvent.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">{selectedEvent.group}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">{selectedEvent.description}</p>
              </DashboardPanel>

              <DashboardPanel title="Timeline Summary">
                <div className="grid gap-3">
                  {eventTypes
                    .filter((type) => type !== 'All')
                    .map((type) => (
                      <article key={type} className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                        <span className="text-sm font-black text-slate-700">{type}</span>
                        <strong className="text-xl font-black text-slate-950">
                          {timelineEvents.filter((event) => event.type === type).length}
                        </strong>
                      </article>
                    ))}
                </div>
              </DashboardPanel>

              <div className="overflow-hidden rounded-lg bg-[#073ca6] text-white">
                <div className="p-5">
                  <p className="text-sm font-bold text-blue-100">Course highlight</p>
                  <h3 className="mt-2 text-2xl font-black">CS302: Algorithms</h3>
                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Use the timeline to keep project checkpoints visible before final submission week.
                  </p>
                  <Button to="/workspace" variant="light" className="mt-5">
                    Back to Workspace
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TimelinePage;
