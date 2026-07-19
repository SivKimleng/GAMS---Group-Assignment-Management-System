import React from 'react';
import heroImage from '../assets/images/gams-hero.png';
import Button from '../components/ui/Button.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import FeatureCard from '../components/landing/FeatureCard.jsx';
import Navbar from '../components/landing/Navbar.jsx';
import { benefits, features } from '../data/landingData.js';
import { hasAuthToken } from '../utils/dataMappers.js';
import { getSession } from '../utils/authSession.js';

function LandingPage() {
  const isAuthenticated = hasAuthToken();
  const session = isAuthenticated ? getSession() : null;
  const firstName = session?.user?.firstName || 'there';

  return (
    <div className="bg-[#f5f7fb]">
      <Navbar isAuthenticated={isAuthenticated} />
      <main>
        <section className="page-container grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.95fr] lg:py-16">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-[#e5fbf8] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#087a75]">
              Student assignment system
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#073ca6] sm:text-5xl lg:text-6xl">
              Master your group projects with ease.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              GAMS helps university students organize groups, assign tasks, monitor progress, and stay ahead of deadlines in one focused workspace.
            </p>
            {!isAuthenticated && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/signup">Get Started</Button>
                <Button to="/login" variant="secondary">
                  Login
                </Button>
              </div>
            )}
            {isAuthenticated && (
              <p className="mt-6 text-sm font-semibold text-slate-500">
                Welcome back, {firstName}. Your session is still active.
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-8 hidden h-24 w-24 rounded-lg bg-[#139f98] opacity-20 lg:block" />
            <div className="card relative overflow-hidden p-2">
              <img
                src={heroImage}
                alt="Laptop displaying a student assignment dashboard"
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-slate-200 bg-white py-16">
          <div className="page-container">
            <SectionHeading
              centered
              eyebrow="Engineered for success"
              title="Everything students need to coordinate group work"
              description="Simple tools for clear responsibilities, transparent progress, and calm deadline management."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="page-container grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Why GAMS"
            title="Built for academic rigor without extra stress"
            description="The interface keeps work visible and organized, so students can focus on completing quality assignments together."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <article key={benefit} className="card p-5">
                <span className="mb-4 grid h-9 w-9 place-items-center rounded-md bg-[#073ca6] text-sm font-black text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-sm font-bold leading-6 text-slate-700">{benefit}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-container pb-16">
          <div className="rounded-lg bg-[#073ca6] px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-black">
              {isAuthenticated ? 'Ready to continue your group work?' : 'Ready to lead your team to an A?'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              {isAuthenticated
                ? 'Open your dashboard or workspace to keep assignments, tasks, and deadlines moving.'
                : 'Join the academic workspace designed for productive collaboration and organized project delivery.'}
            </p>
            {!isAuthenticated && (
              <div className="mt-7 flex justify-center gap-3">
                <Button to="/signup" variant="light">
                  Create Account
                </Button>
                <Button to="/login" variant="dark">
                  Login
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-container flex flex-col gap-3 py-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>GAMS</span>
          <span>(c) 2026 Group Assignment Management System</span>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-[#073ca6]">Features</a>
            <a href="#benefits" className="hover:text-[#073ca6]">Benefits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
