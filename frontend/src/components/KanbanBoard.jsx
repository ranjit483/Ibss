import React, { useState, useEffect } from 'react';
import { Trello, RefreshCw, Briefcase, Plus, ShieldAlert } from 'lucide-react';

function KanbanBoard() {
  const [boardType, setBoardType] = useState('opportunities'); // 'opportunities' or 'projects'
  const [opportunities, setOpportunities] = useState([]);
  const [projectTasks, setProjectTasks] = useState([
    { id: 1, name: 'Setup CRM Database', desc: 'Configure MySQL tables and seed data.', stage: 'todo', priority: 'High' },
    { id: 2, name: 'Design Navigation Panel', desc: 'Create collapsible desktop and mobile sidebar.', stage: 'in-progress', priority: 'Normal' },
    { id: 3, name: 'Integrate Recharts', desc: 'Add sales pipeline visualization on Dashboard.', stage: 'done', priority: 'High' },
    { id: 4, name: 'Implement CSV Import', desc: 'Build CSV parsing utility in Admin panel.', stage: 'todo', priority: 'Low' }
  ]);
  const [loading, setLoading] = useState(true);

  // Opportunity columns
  const opportunityStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  
  // Project columns
  const projectStages = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  useEffect(() => {
    if (boardType === 'opportunities') {
      fetchOpportunities();
    } else {
      setLoading(false);
    }
  }, [boardType]);

  const fetchOpportunities = () => {
    setLoading(true);
    fetch('/api/opportunities')
      .then(res => res.json())
      .then(data => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching opportunities:', err);
        setLoading(false);
      });
  };

  // Drag and Drop handlers
  const handleDragStart = (e, cardId, sourceColumn) => {
    e.dataTransfer.setData('cardId', cardId.toString());
    e.dataTransfer.setData('sourceColumn', sourceColumn);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    
    if (boardType === 'opportunities') {
      const opportunityId = parseInt(cardId, 10);
      const opportunity = opportunities.find(o => o.id === opportunityId);
      
      if (opportunity && opportunity.stage !== targetColumn) {
        // Update local state first for immediate feedback
        setOpportunities(prev => prev.map(o => o.id === opportunityId ? { ...o, stage: targetColumn } : o));

        // Update database
        fetch(`/api/opportunities/${opportunityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...opportunity,
            stage: targetColumn
          })
        }).catch(err => {
          console.error('Failed to update opportunity stage:', err);
          // Revert if error
          fetchOpportunities();
        });
      }
    } else {
      const taskId = parseInt(cardId, 10);
      setProjectTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: targetColumn } : t));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full select-none">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Project Kanban
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Visual workflow board. Drag and drop cards to change status.
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex bg-darkBg-card/40 border border-darkBg-border/50 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setBoardType('opportunities')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              boardType === 'opportunities' 
                ? 'bg-brand-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Opportunities
          </button>
          <button
            onClick={() => setBoardType('projects')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              boardType === 'projects' 
                ? 'bg-brand-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Project Tasks
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-4">Loading pipeline cards...</p>
        </div>
      ) : (
        /* Kanban Board Container */
        <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-4 min-w-[900px] h-full items-start">
            
            {boardType === 'opportunities' ? (
              // ==========================================
              // OPPORTUNITIES KANBAN
              // ==========================================
              opportunityStages.map((stage) => {
                const stageCards = opportunities.filter(o => o.stage === stage);
                const totalAmount = stageCards.reduce((sum, o) => sum + parseFloat(o.amount), 0);

                return (
                  <div
                    key={stage}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                    className="w-72 bg-darkBg-card/15 border border-darkBg-border/30 rounded-2xl p-4 flex flex-col max-h-[600px] min-h-[400px] flex-shrink-0"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-darkBg-border/20 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-300">{stage}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-darkBg-hover text-slate-400 font-semibold">
                          {stageCards.length}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-400 font-bold">
                        NPR {totalAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Column Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
                      {stageCards.length === 0 ? (
                        <div className="h-24 border border-dashed border-darkBg-border/30 rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                          Drop opportunity here
                        </div>
                      ) : (
                        stageCards.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, card.id, stage)}
                            className="bg-darkBg-card/60 hover:bg-darkBg-card border border-darkBg-border/40 hover:border-brand-500/40 p-3 rounded-xl shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 group"
                          >
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors leading-tight">
                              {card.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1.5">
                              Account: <span className="text-slate-400 font-medium">{card.account_name || 'None'}</span>
                            </p>
                            <div className="flex items-center justify-between mt-4 border-t border-darkBg-border/20 pt-2">
                              <span className="text-[11px] font-extrabold text-slate-200">
                                NPR {parseFloat(card.amount).toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium">
                                Close: {new Date(card.close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // ==========================================
              // PROJECT TASKS KANBAN
              // ==========================================
              projectStages.map((stage) => {
                const stageCards = projectTasks.filter(t => t.stage === stage.id);

                return (
                  <div
                    key={stage.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className="w-72 bg-darkBg-card/15 border border-darkBg-border/30 rounded-2xl p-4 flex flex-col max-h-[600px] min-h-[400px] flex-shrink-0"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-darkBg-border/20 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-300">{stage.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-darkBg-hover text-slate-400 font-semibold">
                          {stageCards.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
                      {stageCards.length === 0 ? (
                        <div className="h-24 border border-dashed border-darkBg-border/30 rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                          Drop task here
                        </div>
                      ) : (
                        stageCards.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, card.id, stage.id)}
                            className="bg-darkBg-card/60 hover:bg-darkBg-card border border-darkBg-border/40 hover:border-brand-500/40 p-3.5 rounded-xl shadow-md cursor-grab active:cursor-grabbing transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <h4 className="text-xs font-bold text-slate-200 leading-tight">
                                {card.name}
                              </h4>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                card.priority === 'High' 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                  : card.priority === 'Normal' 
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {card.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                              {card.desc}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
