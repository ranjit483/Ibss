import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserPlus, 
  TrendingUp, 
  CheckSquare, 
  Calendar, 
  LifeBuoy, 
  BookOpen, 
  Settings, 
  Trello, 
  BarChart3, 
  Boxes 
} from 'lucide-react';

function Sidebar({ currentView, handleNavigate, companyName, user }) {
  const menuGroups = [
    {
      title: "Core",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: "CRM Modules",
      items: [
        { id: 'accounts', label: 'Accounts', icon: Building2 },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'leads', label: 'Leads', icon: UserPlus },
        { id: 'opportunities', label: 'Opportunities', icon: TrendingUp }
      ]
    },
    {
      title: "Activities",
      items: [
        { id: 'calendar', label: 'Calendar View', icon: Calendar }
      ]
    },
    {
      title: "Support",
      items: [
        { id: 'cases', label: 'Cases', icon: LifeBuoy },
        { id: 'kb', label: 'Knowledge Base', icon: BookOpen }
      ]
    },
    {
      title: "Official Extensions",
      items: [
        { id: 'kanban', label: 'Project Kanban', icon: Trello },
        { id: 'gantt', label: 'Project Gantt', icon: BarChart3 }
      ]
    },
    {
      title: "System",
      items: [
        { id: 'admin', label: 'Administration', icon: Settings }
      ]
    }
  ];

  return (
    <div className="w-64 h-full bg-darkBg-card/40 backdrop-blur-md border-r border-darkBg-border/50 flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {/* Logo / Branding */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Boxes className="text-white" size={20} />
          </div>
          <div>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-wide text-lg block">
              {companyName}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-brand-400 font-semibold block -mt-0.5">
              Enterprise CRM
            </span>
          </div>
        </div>

        {/* Navigation Menu Groups */}
        <nav className="space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-brand-600/25 text-brand-300 border-l-2 border-brand-500 pl-2.5 shadow-inner' 
                          : 'text-slate-400 hover:bg-darkBg-hover/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-brand-400' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / User Badge */}
      <div className="p-4 border-t border-darkBg-border/40 bg-darkBg-card/10 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold border border-slate-600">
          {user ? user.initials : 'AA'}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{user ? user.name : 'Alex Admin'}</p>
          <p className="text-[10px] text-slate-500 truncate">{user ? (user.role || 'Administrator') : 'Administrator'}</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
