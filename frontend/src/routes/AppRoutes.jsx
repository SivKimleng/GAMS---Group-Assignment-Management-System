import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignUpPage from '../pages/auth/SignUpPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import TimelinePage from '../pages/timeline/TimelinePage.jsx';
import WorkspacePage from '../pages/workspace/WorkspacePage.jsx';
import GroupPage from '../pages/groups/GroupPage.jsx';
import SubmissionPage from '../pages/tasks/SubmissionPage.jsx';
import HelpSupportPage from '../pages/support/HelpSupportPage.jsx';
import { hasAuthToken } from '../utils/dataMappers.js';

function RequireAuth({ children }) {
  if (!hasAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/workspace" element={<RequireAuth><WorkspacePage /></RequireAuth>} />
      <Route path="/groups/:groupId" element={<RequireAuth><GroupPage /></RequireAuth>} />
      <Route path="/tasks/:taskId/submit" element={<RequireAuth><SubmissionPage /></RequireAuth>} />
      <Route path="/help-support" element={<RequireAuth><HelpSupportPage /></RequireAuth>} />
      <Route path="/timeline" element={<RequireAuth><TimelinePage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
