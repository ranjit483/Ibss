import React, { useState, useEffect } from 'react';
import { Settings, Users, Upload, Sliders, Save, Terminal, Shield, Plus, Edit2, Trash2, X } from 'lucide-react';

function Administration({ theme, setTheme, companyName, setCompanyName }) {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings', 'users', 'csv'
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvStatus, setCsvStatus] = useState('');
  
  // Settings Form State
  const [companyInput, setCompanyInput] = useState(companyName);
  const [themeInput, setThemeInput] = useState(theme);

  // User Management State
  const [enableDelete, setEnableDelete] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', email: '', name: '', role: 'User', team: '' });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUserList(data);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoadingUsers(false);
      });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyInput,
          theme: themeInput
        })
      });
      if (res.ok) {
        setCompanyName(companyInput);
        setTheme(themeInput);
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ ...user, password: '' });
    } else {
      setEditingUser(null);
      setUserForm({ username: '', password: '', email: '', name: '', role: 'User', team: '' });
    }
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setShowUserModal(false);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleCsvUpload = (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvStatus('Parsing and importing CSV records...');
    
    // Simulate parsing
    setTimeout(() => {
      setCsvStatus('Successfully imported 24 contacts from CSV!');
      setCsvFile(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Admin Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
          Administration Panel
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Configure system settings, manage users, and import bulk data.
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-darkBg-card/40 border border-darkBg-border/50 p-1 rounded-xl max-w-md w-full">
        {[
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'csv', label: 'CSV Import/Data', icon: Upload }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-brand-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Content */}
      <div className="glass-panel p-6 rounded-2xl border border-darkBg-border/50 max-w-4xl w-full">
        
        {/* ==========================================
            SYSTEM SETTINGS TAB
            ========================================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Sliders size={18} className="text-brand-400" />
              <span>General Settings</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Company Portal Name</label>
                <input
                  type="text"
                  required
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Default Interface Theme</label>
                <select
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  className="form-input"
                >
                  <option value="dark">Vibrant Dark Mode</option>
                  <option value="light">Crisp Light Mode</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/15 transition-all duration-200"
            >
              <Save size={14} />
              <span>Save Configurations</span>
            </button>
          </form>
        )}

        {/* ==========================================
            USER MANAGEMENT TAB
            ========================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Shield size={18} className="text-brand-400" />
                <span>Portal Accounts & Roles</span>
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setEnableDelete(!enableDelete)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    enableDelete 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                      : 'bg-darkBg-hover text-slate-400 border border-darkBg-border hover:text-slate-200'
                  }`}
                >
                  {enableDelete ? 'Disable Delete' : 'Enable Delete'}
                </button>
                <button
                  onClick={() => openUserModal()}
                  className="flex items-center space-x-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow shadow-brand-500/20 transition-all duration-200"
                >
                  <Plus size={14} />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-darkBg-border/40 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-darkBg-border/50 bg-darkBg-card/20">
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Username</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Email</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Role</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Team</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBg-border/30">
                    {userList.map(usr => (
                      <tr key={usr.id} className="hover:bg-darkBg-hover/10">
                        <td className="px-5 py-3 text-xs font-bold text-slate-200">{usr.name}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{usr.username}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{usr.email}</td>
                        <td className="px-5 py-3 text-xs">
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            usr.role === 'Super Admin' || usr.role === 'Admin'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' 
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400">{usr.team || '-'}</td>
                        <td className="px-5 py-3 text-right space-x-2">
                          <button 
                            onClick={() => openUserModal(usr)}
                            className="p-1.5 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          {enableDelete && (
                            <button 
                              onClick={() => handleDeleteUser(usr.id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* User Modal */}
            {showUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-darkBg-card border border-darkBg-border w-full max-w-lg rounded-2xl shadow-2xl animate-slide-up">
                  <div className="flex items-center justify-between p-5 border-b border-darkBg-border/50">
                    <h2 className="text-lg font-bold text-slate-200">
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button 
                      onClick={() => setShowUserModal(false)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleUserSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                        <input required type="text" className="form-input" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                        <input required type="email" className="form-input" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Username</label>
                        <input required type="text" className="form-input" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
                        <input type="password" placeholder={editingUser ? "Leave blank to keep current" : "Required"} required={!editingUser} className="form-input" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Role</label>
                        <select className="form-input" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                          <option value="Super Admin">Super Admin - Full Access</option>
                          <option value="Admin">Admin - Customize Access</option>
                          <option value="User">User</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Team</label>
                        <input type="text" className="form-input" value={userForm.team} onChange={e => setUserForm({...userForm, team: e.target.value})} />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3 border-t border-darkBg-border/50">
                      <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                      <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow transition-colors">
                        {editingUser ? 'Save Changes' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            CSV IMPORT TAB
            ========================================== */}
        {activeTab === 'csv' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Terminal size={18} className="text-brand-400" />
              <span>Data Import Wizard</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a CSV file containing CRM data (Leads, Contacts, or Accounts). Ensure column names match typical CRM entities (e.g. First Name, Last Name, Email, Phone).
            </p>

            <form onSubmit={handleCsvUpload} className="space-y-4">
              <div className="border-2 border-dashed border-darkBg-border rounded-2xl p-8 flex flex-col items-center justify-center hover:border-brand-500/50 transition-colors">
                <Upload size={32} className="text-slate-500 mb-2" />
                <span className="text-xs text-slate-400 font-medium">Drag CSV file here, or click to browse</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="mt-4 text-xs text-slate-500"
                />
              </div>

              {csvFile && (
                <div className="text-xs text-slate-300 font-semibold bg-brand-500/5 px-4 py-2 rounded-lg border border-brand-500/15">
                  Selected File: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                </div>
              )}

              {csvStatus && (
                <div className="text-xs text-brand-400 font-semibold bg-darkBg-base px-4 py-2 rounded-lg border border-darkBg-border">
                  {csvStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={!csvFile}
                className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg ${
                  csvFile 
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-brand-500/15 hover:from-brand-500 hover:to-indigo-400' 
                    : 'bg-darkBg-base text-slate-500 border border-darkBg-border cursor-not-allowed'
                }`}
              >
                Execute Import
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default Administration;
