import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye, ChevronDown } from 'lucide-react';

function CrudModule({ type, title }) {
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]); // Needed for dropdowns
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // null for create, object for edit
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedItem, setViewedItem] = useState(null);

  // Dynamic form state
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
    if (['contacts', 'opportunities', 'cases'].includes(type)) {
      fetchAccounts();
    }
  }, [type]);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/${type}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Error loading ${type}:`, err);
        setLoading(false);
      });
  };

  const fetchAccounts = () => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(err => console.error('Error loading accounts:', err));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenCreateModal = () => {
    setCurrentItem(null);
    // Initialize empty form data
    const initialForm = {};
    getFields().forEach(field => {
      initialForm[field.name] = field.defaultValue || '';
    });
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setCurrentItem(item);
    // Pre-populate form data
    const populatedForm = {};
    getFields().forEach(field => {
      // Format dates for input type="date"
      if (field.type === 'date' && item[field.name]) {
        populatedForm[field.name] = item[field.name].slice(0, 10);
      } else {
        populatedForm[field.name] = item[field.name] || '';
      }
    });
    setFormData(populatedForm);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (item) => {
    setViewedItem(item);
    setIsViewModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!currentItem;
    const url = isEdit ? `/api/${type}/${currentItem.id}` : `/api/${type}`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(`Failed to save ${type}:`, err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  // Define fields based on module type
  const getFields = () => {
    switch (type) {
      case 'accounts':
        return [
          { name: 'name', label: 'Account Name', type: 'text', required: true },
          { name: 'industry', label: 'Industry', type: 'select', options: ['Technology', 'Financial Services', 'Telecommunications', 'Agriculture', 'Healthcare', 'Retail', 'Other'] },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'description', label: 'Description', type: 'textarea' }
        ];
      case 'contacts':
        return [
          { name: 'first_name', label: 'First Name', type: 'text', required: true },
          { name: 'last_name', label: 'Last Name', type: 'text', required: true },
          { name: 'account_id', label: 'Account', type: 'select-account' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'title', label: 'Job Title', type: 'text' }
        ];
      case 'leads':
        return [
          { name: 'first_name', label: 'First Name', type: 'text', required: true },
          { name: 'last_name', label: 'Last Name', type: 'text', required: true },
          { name: 'status', label: 'Status', type: 'select', options: ['New', 'Assigned', 'In Process', 'Converted'], defaultValue: 'New' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'title', label: 'Job Title', type: 'text' },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'campaign', label: 'Campaign Tracking', type: 'text' }
        ];
      case 'opportunities':
        return [
          { name: 'name', label: 'Opportunity Name', type: 'text', required: true },
          { name: 'stage', label: 'Stage', type: 'select', options: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'], defaultValue: 'Prospecting' },
          { name: 'amount', label: 'Financial Amount (NPR)', type: 'number', required: true },
          { name: 'probability', label: 'Probability (%)', type: 'number', defaultValue: 10 },
          { name: 'close_date', label: 'Close Date', type: 'date', required: true },
          { name: 'lead_source', label: 'Lead Source', type: 'select', options: ['Cold Outreach', 'Google Search Ad', 'Referral', 'Summer Expo 2026', 'Other'] },
          { name: 'account_id', label: 'Account', type: 'select-account' }
        ];
      case 'cases':
        return [
          { name: 'title', label: 'Case Subject', type: 'text', required: true },
          { name: 'status', label: 'Status', type: 'select', options: ['New', 'Assigned', 'In Process', 'Closed'], defaultValue: 'New' },
          { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Normal', 'High'], defaultValue: 'Normal' },
          { name: 'account_id', label: 'Account', type: 'select-account' },
          { name: 'description', label: 'Description', type: 'textarea' }
        ];
      default:
        return [];
    }
  };

  // Helper to render badge styles
  const renderBadge = (val) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    let badgeClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    
    if (lower === 'new') badgeClass = 'badge-new';
    else if (lower === 'assigned') badgeClass = 'badge-assigned';
    else if (lower === 'in process' || lower === 'started') badgeClass = 'badge-inprocess';
    else if (lower === 'converted' || lower === 'closed won' || lower === 'closed') badgeClass = 'badge-converted';
    else if (lower === 'prospecting') badgeClass = 'badge-prospecting';
    else if (lower === 'negotiation') badgeClass = 'badge-negotiation';
    else if (lower === 'high') badgeClass = 'badge-priority-high';
    else if (lower === 'normal') badgeClass = 'badge-priority-normal';

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${badgeClass}`}>
        {val}
      </span>
    );
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const values = Object.values(item).map(v => String(v).toLowerCase());
    return values.some(val => val.includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage records, search, filter, and create new items.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-start sm:self-auto w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0 max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-darkBg-card/40 border border-darkBg-border/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 transition-all duration-200 flex-shrink-0"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-4">Retrieving ledger records...</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-darkBg-border/50 overflow-hidden">
          {/* Mobile Layout (Cards) */}
          <div className="block lg:hidden divide-y divide-darkBg-border/30">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No records found.</div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">
                        {type === 'accounts' ? item.name : type === 'cases' ? item.title : `${item.first_name || item.name} ${item.last_name || ''}`}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.email || item.website || item.phone || ''}
                      </p>
                    </div>
                    {renderBadge(item.status || item.stage || item.priority)}
                  </div>
                  <div className="flex justify-end space-x-2 pt-2 border-t border-darkBg-border/10">
                    <button onClick={() => handleOpenViewModal(item)} className="p-1.5 rounded-lg bg-darkBg-hover text-slate-400 hover:text-slate-200"><Eye size={14} /></button>
                    <button onClick={() => handleOpenEditModal(item)} className="p-1.5 rounded-lg bg-darkBg-hover text-slate-400 hover:text-slate-200"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 rounded-lg bg-darkBg-hover text-rose-500/80 hover:text-rose-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Layout (Table) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBg-border/50 bg-darkBg-card/25">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {type === 'accounts' ? 'Account Name' : type === 'cases' ? 'Case Title' : 'Name'}
                  </th>
                  {type === 'accounts' && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Industry</th>}
                  {['contacts', 'opportunities', 'cases'].includes(type) && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</th>}
                  {['leads', 'contacts', 'accounts'].includes(type) && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>}
                  {['leads', 'contacts', 'accounts'].includes(type) && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>}
                  {type === 'opportunities' && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>}
                  {type === 'opportunities' && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Close Date</th>}
                  {['leads', 'opportunities', 'cases'].includes(type) && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status/Stage</th>}
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBg-border/30">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-xs">No records found.</td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-darkBg-hover/15 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-200">
                        {type === 'accounts' ? item.name : type === 'cases' ? item.title : `${item.first_name || item.name} ${item.last_name || ''}`}
                      </td>
                      {type === 'accounts' && <td className="px-6 py-4 text-xs text-slate-400">{item.industry || '-'}</td>}
                      {['contacts', 'opportunities', 'cases'].includes(type) && (
                        <td className="px-6 py-4 text-xs text-slate-400">{item.account_name || '-'}</td>
                      )}
                      {['leads', 'contacts', 'accounts'].includes(type) && (
                        <td className="px-6 py-4 text-xs text-slate-400">{item.email || '-'}</td>
                      )}
                      {['leads', 'contacts', 'accounts'].includes(type) && (
                        <td className="px-6 py-4 text-xs text-slate-400">{item.phone || '-'}</td>
                      )}
                      {type === 'opportunities' && (
                        <td className="px-6 py-4 text-xs font-bold text-slate-200">NPR {parseFloat(item.amount).toLocaleString()}</td>
                      )}
                      {type === 'opportunities' && (
                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(item.close_date).toLocaleDateString()}</td>
                      )}
                      {['leads', 'opportunities', 'cases'].includes(type) && (
                        <td className="px-6 py-4 text-xs">{renderBadge(item.status || item.stage || item.priority)}</td>
                      )}
                      <td className="px-6 py-4 text-xs text-right space-x-1.5">
                        <button 
                          onClick={() => handleOpenViewModal(item)}
                          className="p-1.5 rounded-lg bg-darkBg-card border border-darkBg-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500/30 transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-darkBg-card border border-darkBg-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500/30 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg bg-darkBg-card border border-darkBg-border/40 text-rose-500/80 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-darkBg-border shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-200">
                {currentItem ? `Edit ${title.slice(0, -1)}` : `Create ${title.slice(0, -1)}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFields().map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="form-input resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'select-account' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  )}
                </div>
              ))}

              <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-darkBg-border text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-darkBg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && viewedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBg-border shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-6 border-b border-darkBg-border/30 pb-3">
              <div>
                <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">{title.slice(0, -1)} Details</span>
                <h3 className="text-base font-bold text-slate-200 mt-0.5">
                  {type === 'accounts' ? viewedItem.name : type === 'cases' ? viewedItem.title : `${viewedItem.first_name} ${viewedItem.last_name}`}
                </h3>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {getFields().map((field) => (
                <div key={field.name} className="border-b border-darkBg-border/10 pb-2">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider block">{field.label}</span>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    {field.name === 'account_id' 
                      ? (viewedItem.account_name || 'None') 
                      : (field.name === 'amount' 
                        ? `NPR ${parseFloat(viewedItem[field.name] || 0).toLocaleString()}` 
                        : (field.type === 'select' || field.name === 'status' || field.name === 'stage' || field.name === 'priority'
                          ? renderBadge(viewedItem[field.name])
                          : (viewedItem[field.name] || '-')))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-darkBg-hover border border-darkBg-border text-xs font-bold text-slate-300 hover:text-slate-100"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CrudModule;
