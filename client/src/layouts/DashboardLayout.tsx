import React from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { MedBotChat } from '../components/MedBotChat';

export const DashboardLayout: React.FC<{ children: React.ReactNode; showSidebar?: boolean }> = ({
  children,
  showSidebar = true
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
      {/* MedBot AI Chatbot — available on all dashboard pages */}
      <MedBotChat />
    </div>
  );
};
