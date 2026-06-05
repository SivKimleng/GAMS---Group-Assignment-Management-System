import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignUpPage from '../pages/auth/SignUpPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import LeaderPanelPage from '../pages/dashboard/LeaderPanelPage.jsx';
import TimelinePage from '../pages/timeline/TimelinePage.jsx';
import WorkspacePage from '../pages/workspace/WorkspacePage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/leader" element={<LeaderPanelPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
