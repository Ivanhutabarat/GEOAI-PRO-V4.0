import React from 'react';
import SecurityShield from './components/SecurityShield';
import DummyDashboardWrapper from './cores/dummy/MainDashboard';
import LiveDashboardWrapper from './cores/live/MainDashboard';
import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  let mode = 'DUMMY';
  try {
    mode = localStorage.getItem('geoai_mode') || 'DUMMY';
  } catch (e) {}

  return (
    <ErrorBoundary>
      {/* Global Anti-Debugger & Anti-Tamper Core Protection */}
      <SecurityShield />
      
      {mode === 'LIVE' ? <LiveDashboardWrapper /> : <DummyDashboardWrapper />}
    </ErrorBoundary>
  );
}
