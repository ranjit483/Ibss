import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Phone, Users, CheckSquare } from 'lucide-react';

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [eventType, setEventType] = useState('Call'); // 'Call', 'Meeting', 'Task'
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('12:00');
  const [duration, setDuration] = useState('30');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [callsRes, meetingsRes, tasksRes] = await Promise.all([
        fetch('/api/calls').then(r => r.json()),
        fetch('/api/meetings').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json())
      ]);

      const formattedCalls = callsRes.map(c => ({
        id: `call-${c.id}`,
        title: c.subject,
        date: new Date(c.date_start),
        type: 'Call',
        status: c.status
      }));

      const formattedMeetings = meetingsRes.map(m => ({
        id: `meeting-${m.id}`,
        title: m.subject,
        date: new Date(m.date_start),
        type: 'Meeting',
        status: m.status
      }));

      const formattedTasks = tasksRes.map(t => ({
        id: `task-${t.id}`,
        title: t.name,
        date: new Date(t.date_due),
        type: 'Task',
        status: t.status
      }));

      setEvents([...formattedCalls, ...formattedMeetings, ...formattedTasks]);
      setLoading(false);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setLoading(false);
    }
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dayNum) => {
    const clickedDate = new Date(year, month, dayNum);
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !selectedDate) return;

    // Build ISO datetime string
    const [hours, minutes] = time.split(':');
    const eventDate = new Date(selectedDate);
    eventDate.setHours(parseInt(hours, 10));
    eventDate.setMinutes(parseInt(minutes, 10));
    
    const formattedDateTime = eventDate.toISOString().slice(0, 19).replace('T', ' ');

    let endpoint = '/api/calls';
    let body = {};

    if (eventType === 'Call') {
      endpoint = '/api/calls';
      body = {
        subject,
        status: 'Planned',
        date_start: formattedDateTime,
        duration: parseInt(duration, 10),
        parent_type: 'Contact',
        parent_id: null
      };
    } else if (eventType === 'Meeting') {
      endpoint = '/api/meetings';
      body = {
        subject,
        status: 'Planned',
        date_start: formattedDateTime,
        duration: parseInt(duration, 10),
        location
      };
    } else {
      endpoint = '/api/tasks';
      body = {
        name: subject,
        priority: 'Normal',
        status: 'Not Started',
        date_due: formattedDateTime,
        assigned_user_id: null
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setSubject('');
        setTime('12:00');
        setDuration('30');
        setLocation('');
        fetchEvents(); // reload events
      }
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  // Generate calendar days
  const days = [];
  // Fill previous month padding days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-darkBg-card/5 border border-darkBg-border/10"></div>);
  }
  // Fill actual month days
  for (let d = 1; d <= daysInMonth; d++) {
    const tempDate = new Date(year, month, d);
    const dayEvents = events.filter(e => 
      e.date.getDate() === d && 
      e.date.getMonth() === month && 
      e.date.getFullYear() === year
    );

    const isToday = 
      d === new Date().getDate() && 
      month === new Date().getMonth() && 
      year === new Date().getFullYear();

    days.push(
      <div 
        key={`day-${d}`} 
        onClick={() => handleDayClick(d)}
        className={`h-28 border border-darkBg-border/40 p-1.5 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-darkBg-hover/30 ${
          isToday ? 'bg-brand-500/5 border-brand-500/40' : 'bg-darkBg-card/10'
        }`}
      >
        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
          isToday ? 'bg-brand-600 text-white shadow shadow-brand-500/25' : 'text-slate-400 group-hover:text-slate-200'
        }`}>
          {d}
        </span>
        <div className="flex-1 overflow-y-auto space-y-1 mt-1.5 scrollbar-none">
          {dayEvents.map(ev => {
            const isCall = ev.type === 'Call';
            const isMeeting = ev.type === 'Meeting';
            return (
              <div 
                key={ev.id} 
                className={`text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-1 truncate font-medium ${
                  isCall 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' 
                    : isMeeting 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                }`}
                title={`${ev.type}: ${ev.title}`}
              >
                {isCall ? <Phone size={8} /> : isMeeting ? <Users size={8} /> : <CheckSquare size={8} />}
                <span className="truncate">{ev.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full select-none">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Calendar View
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Schedule calls, track meetings, and manage deadlines.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex bg-darkBg-card/40 border border-darkBg-border/50 rounded-xl p-0.5">
            <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToToday} className="px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 rounded-lg">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => handleDayClick(new Date().getDate())}
            className="flex items-center space-x-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 transition-all duration-200"
          >
            <Plus size={14} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-4">Syncing calendar schedule...</p>
        </div>
      ) : (
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-darkBg-border/50">
          {/* Calendar Month Name */}
          <h2 className="text-lg font-extrabold text-slate-200 mb-6 flex items-center space-x-2">
            <Calendar className="text-brand-400" size={20} />
            <span>{monthNames[month]} {year}</span>
          </h2>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-bold text-slate-500 py-2 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 bg-darkBg-border/20 rounded-xl overflow-hidden border border-darkBg-border/20">
            {days}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBg-border shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-200">
                Add Event for {selectedDate?.toLocaleDateString()}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Event Type</label>
                <div className="flex bg-darkBg-base border border-darkBg-border rounded-xl p-1">
                  {['Call', 'Meeting', 'Task'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                        eventType === type 
                          ? 'bg-brand-600 text-white shadow' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Subject / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discuss proposal pricing"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-input"
                  />
                </div>
                {eventType !== 'Task' && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Duration (mins)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="form-input"
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Location (Meetings only) */}
              {eventType === 'Meeting' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Zoom link or Office Room A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-brand-500/15 transition-all mt-6"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
