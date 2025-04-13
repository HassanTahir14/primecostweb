import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Dashboard from '@/app/dashboard/page';

import './App.css';
import Sidebar from '@/components/Sidebar';


function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#F5F7F6]">
        <Sidebar isOpen={false} onOpenChange={function (open: boolean): void {
                  throw new Error('Function not implemented.');
              } } />
        <main className="flex-1 ml-[72px] p-6">
          <Dashboard />
        </main>
      </div>
    </Router>
  );
}

export default App; 