import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CrudModule from './components/CrudModule';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import KnowledgeBase from './components/KnowledgeBase';
import Administration from './components/Administration';
import GanttChart from './components/GanttChart';
import Login from './components/Login';
import { Menu, X } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    name: 'Mana Raja',
    email: 'ranjitmanaraja@gmail.com',
    initials: 'MR'
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [companyName, setCompanyName] = useState('EspoCRM Nepal');

  // Load settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.theme) setTheme(data.theme);
        if (data.company_name) setCompanyName(data.company_name);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  // Render active component
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard handleNavigate={handleNavigate} />;
      case 'accounts':
        return <CrudModule type="accounts" title="Accounts" key="accounts" />;
      case 'contacts':
        return <CrudModule type="contacts" title="Contacts" key="contacts" />;
      case 'leads':
        return <CrudModule type="leads" title="Leads" key="leads" />;
      case 'opportunities':
        return <CrudModule type="opportunities" title="Opportunities" key="opportunities" />;
      case 'kanban':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'cases':
        return <CrudModule type="cases" title="Cases" key="cases" />;
      case 'kb':
        return <KnowledgeBase />;
      case 'admin':
        return <Administration theme={theme} setTheme={setTheme} companyName={companyName} setCompanyName={setCompanyName} />;
      case 'gantt':
        return <GanttChart />;
      default:
        return <Dashboard handleNavigate={handleNavigate} />;
    }
  };

  const renderAppLayout = () => (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar currentView={currentView} handleNavigate={handleNavigate} companyName={companyName} user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden transition-transform duration-300 ease-in-out bg-darkBg-card/95 border-r border-darkBg-border shadow-2xl`}>
        <div className="flex justify-end p-4">
          <button onClick={toggleMobileSidebar} className="text-slate-400 hover:text-slate-100">
            <X size={24} />
          </button>
        </div>
        <Sidebar currentView={currentView} handleNavigate={handleNavigate} companyName={companyName} user={user} />
      </div>

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header 
          toggleMobileSidebar={toggleMobileSidebar} 
          companyName={companyName} 
          handleNavigate={handleNavigate} 
          handleLogout={handleLogout}
          user={user}
        />

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );

  return isAuthenticated ? renderAppLayout() : <Login onLogin={handleLogin} companyName={companyName} />;
}

export default App;
