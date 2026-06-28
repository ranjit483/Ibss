import React, { useState } from 'react';
import { Menu, Search, Bell, HelpCircle, Plus, ChevronDown, LogOut, User, Settings } from 'lucide-react';

function Header({ toggleMobileSidebar, companyName, handleNavigate, handleLogout, user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: "New lead assigned to you: Anil Karki", time: "10m ago", unread: true },
    { id: 2, text: "Meeting 'Partnership Negotiation' starts in 1 hour", time: "1h ago", unread: true },
    { id: 3, text: "Opportunity 'Enterprise Software Licensing' moved to Negotiation", time: "4h ago", unread: false }
  ];

  return (
    <header className="h-16 bg-darkBg-card/20 backdrop-blur-md border-b border-darkBg-border/50 px-4 md:px-6 lg:px-8 flex items-center justify-between relative z-30 select-none">
      {/* Left side: Mobile Menu Button & Search */}
      <div className="flex items-center space-x-4 flex-1">
        <button 
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-darkBg-hover hover:text-slate-200"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center max-w-md w-full relative">
          <Search className="absolute left-3 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search accounts, contacts, leads..." 
            className="w-full bg-darkBg-base/60 border border-darkBg-border/50 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side: Actions, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Add Button */}
        <button 
          onClick={() => handleNavigate('leads')}
          className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-brand-500/10 transition-all duration-200"
        >
          <Plus size={14} />
          <span>New Lead</span>
        </button>

        {/* Help Center */}
        <button 
          onClick={() => handleNavigate('kb')}
          className="p-2 rounded-xl text-slate-400 hover:bg-darkBg-hover hover:text-slate-200 transition-colors"
          title="Help & Knowledge Base"
        >
          <HelpCircle size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="p-2 rounded-xl text-slate-400 hover:bg-darkBg-hover hover:text-slate-200 transition-colors relative"
          >
            <Bell size={18} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-darkBg-base"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl py-2 z-50 animate-slide-up border border-darkBg-border">
              <div className="px-4 py-2 border-b border-darkBg-border/50 flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-200">Notifications</span>
                <button className="text-[10px] text-brand-400 hover:underline">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-darkBg-border/30 hover:bg-darkBg-hover/45 transition-colors cursor-pointer ${n.unread ? 'bg-brand-500/5' : ''}`}>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-darkBg-hover transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-xs text-white font-bold">
              {user ? user.initials : 'AA'}
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel shadow-2xl py-2 z-50 animate-slide-up border border-darkBg-border">
              <div className="px-4 py-2 border-b border-darkBg-border/50">
                <p className="text-xs font-semibold text-slate-200">{user ? user.name : 'Alex Admin'}</p>
                <p className="text-[10px] text-slate-500">{user ? user.email : 'admin@example.com'}</p>
              </div>
              <button 
                onClick={() => { handleNavigate('admin'); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-darkBg-hover/60 transition-colors text-left"
              >
                <Settings size={14} />
                <span>Administration</span>
              </button>
              <button 
                onClick={() => { handleNavigate('kb'); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-darkBg-hover/60 transition-colors text-left"
              >
                <User size={14} />
                <span>Profile Settings</span>
              </button>
              <div className="border-t border-darkBg-border/50 my-1"></div>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  if (handleLogout) handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-darkBg-hover/60 transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
