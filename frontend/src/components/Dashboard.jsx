import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  UserPlus, 
  TrendingUp, 
  CheckSquare, 
  LifeBuoy, 
  Calendar, 
  Phone, 
  Briefcase,
  ArrowRight
} from 'lucide-react';

function Dashboard({ handleNavigate }) {
  const [stats, setStats] = useState({ leads: 0, opportunities: 0, tasks: 0, cases: 0, revenue: 0 });
  const [pipelineData, setPipelineData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        
        // Format pipeline data for chart
        const stagesOrder = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
        const formattedPipeline = stagesOrder.map(stage => {
          const found = data.pipeline.find(item => item.stage === stage);
          return {
            name: stage,
            value: found ? parseFloat(found.value) : 0,
            count: found ? found.count : 0
          };
        });
        setPipelineData(formattedPipeline);
        setActivities(data.activities);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  const kpis = [
    { 
      label: 'Leads', 
      value: stats.leads, 
      icon: UserPlus, 
      color: 'from-blue-500 to-indigo-500', 
      shadow: 'shadow-blue-500/10',
      view: 'leads' 
    },
    { 
      label: 'Closed Revenue', 
      value: `NPR ${(stats.revenue / 100000).toFixed(1)}L`, 
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-500', 
      shadow: 'shadow-emerald-500/10',
      view: 'opportunities' 
    },
    { 
      label: 'Open Tasks', 
      value: stats.tasks, 
      icon: CheckSquare, 
      color: 'from-amber-500 to-orange-500', 
      shadow: 'shadow-amber-500/10',
      view: 'calendar' 
    },
    { 
      label: 'Active Cases', 
      value: stats.cases, 
      icon: LifeBuoy, 
      color: 'from-rose-500 to-pink-500', 
      shadow: 'shadow-rose-500/10',
      view: 'cases' 
    }
  ];

  // Custom bar colors
  const COLORS = ['#64748B', '#a855f7', '#f59e0b', '#f97316', '#10b981'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 mt-4">Analyzing corporate intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Home Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time analytics, pipeline status, and key performance indicators.
          </p>
        </div>
        <div className="text-xs text-slate-400 glass-panel px-4 py-2 rounded-xl border border-darkBg-border/50 self-start md:self-auto">
          Last updated: <span className="font-semibold text-brand-400">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              onClick={() => handleNavigate(kpi.view)}
              className="glass-panel glass-panel-hover p-4 md:p-6 rounded-2xl cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-slate-400">{kpi.label}</span>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-lg ${kpi.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-slate-100 mt-4 tracking-tight">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Pipeline Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-darkBg-border/50 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-200">Sales Pipeline</h2>
              <p className="text-xs text-slate-500">Value of deals in different stages of the sales cycle (NPR)</p>
            </div>
            <button 
              onClick={() => handleNavigate('opportunities')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>Opportunities</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pipelineData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.85}/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2942" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748B" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `NPR ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#151D30', 
                    borderColor: '#223150', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                  formatter={(value, name, props) => [`NPR ${value.toLocaleString()}`, 'Value']}
                  labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Activities Sidebar */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBg-border/50 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-200">My Activities</h2>
              <p className="text-xs text-slate-500">Immediate tasks, calls, & meetings</p>
            </div>
            <button 
              onClick={() => handleNavigate('calendar')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>Calendar</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Calendar size={32} className="stroke-[1.5] mb-2 text-slate-600" />
                <p className="text-xs">No pending activities.</p>
              </div>
            ) : (
              activities.map((activity) => {
                const isTask = activity.type === 'Task';
                const isCall = activity.type === 'Call';
                
                return (
                  <div 
                    key={activity.id} 
                    className="p-3 bg-darkBg-base/50 border border-darkBg-border/45 rounded-xl flex items-start justify-between hover:border-brand-500/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${
                        isTask ? 'bg-amber-500/10 text-amber-400' : isCall ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {isCall ? <Phone size={14} /> : <Calendar size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{activity.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                      activity.status === 'Completed' || activity.status === 'Held' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
