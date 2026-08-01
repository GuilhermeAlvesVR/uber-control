import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggleCollapsed={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 pb-16 md:pb-0 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <div className="max-w-7xl mx-auto p-4 md:p-6 pt-16 md:pt-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
