import React, { useState } from 'react';
import { BarChart3, Calendar, Plus, RefreshCw } from 'lucide-react';

function GanttChart() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Setup MySQL Database', start: 1, duration: 3, progress: 100, team: 'DevOps' },
    { id: 2, name: 'Build Express Rest API', start: 3, duration: 4, progress: 80, team: 'Backend' },
    { id: 3, name: 'Design Collapsible Navbar', start: 5, duration: 3, progress: 100, team: 'UI/UX' },
    { id: 4, name: 'Develop Kanban View', start: 7, duration: 5, progress: 90, team: 'Frontend' },
    { id: 5, name: 'Integrate Recharts', start: 10, duration: 4, progress: 40, team: 'Frontend' },
    { id: 6, name: 'CSV Import & Export Wizard', start: 12, duration: 5, progress: 10, team: 'Backend' },
    { id: 7, name: 'System Testing & QA', start: 15, duration: 4, progress: 0, team: 'QA' },
    { id: 8, name: 'Production Deployment', start: 18, duration: 3, progress: 0, team: 'DevOps' }
  ]);

  // Total timeline units (days/weeks)
  const totalUnits = 22;
  const unitsArray = Array.from({ length: totalUnits }, (_, i) => i + 1);

  const handleProgressChange = (taskId, newProgress) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: parseInt(newProgress, 10) } : t));
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Gantt Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Project Gantt Chart
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Visual project schedule timeline. Adjust task progress using sliders.
          </p>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-darkBg-border/50 overflow-x-auto scrollbar-thin">
        <div className="min-w-[900px]">
          
          {/* Timeline Header */}
          <div className="grid grid-cols-12 gap-2 border-b border-darkBg-border/40 pb-4 mb-4">
            <div className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Task details & Progress</div>
            <div className="col-span-8 flex justify-between pr-4">
              {unitsArray.map(unit => (
                <div key={unit} className="w-6 text-center text-[10px] font-bold text-slate-500">
                  W{unit}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks List & Timeline Bars */}
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="grid grid-cols-12 gap-2 items-center hover:bg-darkBg-hover/10 py-1.5 rounded-xl transition-colors">
                
                {/* Task Details */}
                <div className="col-span-4 space-y-1 pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{task.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400 px-1.5 py-0.5 rounded bg-brand-500/10">
                      {task.team}
                    </span>
                  </div>
                  
                  {/* Progress Slider */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => handleProgressChange(task.id, e.target.value)}
                      className="w-24 accent-brand-500 h-1 bg-darkBg-base border border-darkBg-border rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-slate-400 w-8">{task.progress}%</span>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="col-span-8 relative h-8 bg-darkBg-base/30 border border-darkBg-border/20 rounded-xl overflow-hidden flex items-center pr-4">
                  
                  {/* Timeline grid lines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none">
                    {unitsArray.map(unit => (
                      <div key={unit} className="w-[1px] h-full bg-darkBg-border/10"></div>
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div 
                    style={{
                      marginLeft: `${((task.start - 1) / totalUnits) * 100}%`,
                      width: `${(task.duration / totalUnits) * 100}%`
                    }}
                    className="h-5 rounded-lg bg-darkBg-border border border-brand-500/15 relative overflow-hidden flex items-center justify-between px-2 shadow-inner"
                  >
                    {/* Progress Fill */}
                    <div 
                      style={{ width: `${task.progress}%` }}
                      className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-300 pointer-events-none"
                    ></div>
                    
                    {/* Text Label on Bar */}
                    <span className="text-[9px] font-extrabold text-white z-10 truncate pl-1">
                      {task.progress > 0 && `${task.progress}%`}
                    </span>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default GanttChart;
