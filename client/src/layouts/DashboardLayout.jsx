import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Seo from '../components/Seo';

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f2]">
      <Seo
        title="Dashboard"
        description="Secure FitLedger dashboard for managing gym members, subscriptions, payments, and reports."
        path={location.pathname}
        robots="noindex, nofollow"
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div
            key={location.pathname}
            className="animate-fade-in"
            style={{ animationDuration: '0.2s' }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
