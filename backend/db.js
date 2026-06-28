const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'ibss.onlinenepa.com',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u382450994_ibssdata',
  password: process.env.DB_PASSWORD || '1234@manaR#',
  database: process.env.DB_NAME || 'u382450994_ibss',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let useLocalJson = false;
const jsonDbPath = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

async function getPool() {
  if (useLocalJson) return null;
  if (pool) return pool;

  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    pool = mysql.createPool(dbConfig);
    console.log(`Successfully connected to MySQL database: ${dbConfig.database}`);
    return pool;
  } catch (err) {
    console.warn(`[DB] Failed to connect to MySQL at ${dbConfig.host}: ${err.message}`);
    console.error(err);
    console.warn('[DB] Falling back to local JSON database for testing.');
    useLocalJson = true;
    return null;
  }
}

// Read from JSON file
function readJsonDb() {
  if (!fs.existsSync(jsonDbPath)) {
    // Write empty DB structure if not exists
    const initialDb = {
      users: [], accounts: [], contacts: [], leads: [],
      opportunities: [], tasks: [], calls: [], meetings: [],
      cases: [], kb_articles: [], settings: []
    };
    fs.writeFileSync(jsonDbPath, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
}

// Write to JSON file
function writeJsonDb(data) {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
}

// Simple Javascript query runner for the JSON database
function runJsonQuery(sql, params = []) {
  const db = readJsonDb();
  const sqlNormalized = sql.replace(/\s+/g, ' ').trim();

  // --------------------------------------------------
  // 1. DASHBOARD QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT COUNT(*) as count FROM leads')) {
    return [{ count: db.leads.length }];
  }
  if (sqlNormalized.startsWith('SELECT COUNT(*) as count FROM opportunities')) {
    return [{ count: db.opportunities.length }];
  }
  if (sqlNormalized.startsWith("SELECT COUNT(*) as count FROM tasks WHERE status != 'Completed'")) {
    return [{ count: db.tasks.filter(t => t.status !== 'Completed').length }];
  }
  if (sqlNormalized.startsWith("SELECT COUNT(*) as count FROM cases WHERE status != 'Closed'")) {
    return [{ count: db.cases.filter(c => c.status !== 'Closed').length }];
  }
  if (sqlNormalized.startsWith("SELECT SUM(amount) as total FROM opportunities WHERE stage = 'Closed Won'")) {
    const total = db.opportunities
      .filter(o => o.stage === 'Closed Won')
      .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    return [{ total }];
  }
  if (sqlNormalized.startsWith('SELECT stage, COUNT(*) as count, SUM(amount) as value FROM opportunities GROUP BY stage')) {
    const stages = {};
    db.opportunities.forEach(o => {
      if (!stages[o.stage]) {
        stages[o.stage] = { stage: o.stage, count: 0, value: 0 };
      }
      stages[o.stage].count += 1;
      stages[o.stage].value += parseFloat(o.amount || 0);
    });
    return Object.values(stages);
  }
  if (sqlNormalized.includes("SELECT id, subject as title, date_start as date, 'Call' as type")) {
    const calls = db.calls.map(c => ({ id: c.id, title: c.subject, date: c.date_start, type: 'Call', status: c.status }));
    return calls.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  }
  if (sqlNormalized.includes("SELECT id, subject as title, date_start as date, 'Meeting' as type")) {
    const mtgs = db.meetings.map(m => ({ id: m.id, title: m.subject, date: m.date_start, type: 'Meeting', status: m.status }));
    return mtgs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  }
  if (sqlNormalized.includes("SELECT id, name as title, date_due as date, 'Task' as type")) {
    const tsks = db.tasks
      .filter(t => t.status !== 'Completed')
      .map(t => ({ id: t.id, title: t.name, date: t.date_due, type: 'Task', status: t.status }));
    return tsks.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
  }

  // --------------------------------------------------
  // 2. ACCOUNTS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT * FROM accounts ORDER BY name')) {
    return [...db.accounts].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sqlNormalized.startsWith('INSERT INTO accounts')) {
    const [name, industry, website, phone, email, description] = params;
    const newId = db.accounts.length > 0 ? Math.max(...db.accounts.map(a => a.id)) + 1 : 1;
    db.accounts.push({ id: newId, name, industry, website, phone, email, description, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE accounts SET')) {
    const [name, industry, website, phone, email, description, id] = params;
    db.accounts = db.accounts.map(a => a.id === parseInt(id, 10) ? { ...a, name, industry, website, phone, email, description } : a);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM accounts WHERE id = ?')) {
    const [id] = params;
    db.accounts = db.accounts.filter(a => a.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 3. CONTACTS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.includes('FROM contacts c LEFT JOIN accounts a ON c.account_id = a.id')) {
    return db.contacts.map(c => {
      const acc = db.accounts.find(a => a.id === parseInt(c.account_id, 10));
      return { ...c, account_name: acc ? acc.name : null };
    }).sort((a, b) => {
      const ln = (a.last_name || '').localeCompare(b.last_name || '');
      if (ln !== 0) return ln;
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  }
  if (sqlNormalized.startsWith('INSERT INTO contacts')) {
    const [first_name, last_name, account_id, email, phone, title] = params;
    const newId = db.contacts.length > 0 ? Math.max(...db.contacts.map(c => c.id)) + 1 : 1;
    db.contacts.push({ id: newId, first_name, last_name, account_id: account_id ? parseInt(account_id, 10) : null, email, phone, title, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE contacts SET')) {
    const [first_name, last_name, account_id, email, phone, title, id] = params;
    db.contacts = db.contacts.map(c => c.id === parseInt(id, 10) ? { ...c, first_name, last_name, account_id: account_id ? parseInt(account_id, 10) : null, email, phone, title } : c);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM contacts WHERE id = ?')) {
    const [id] = params;
    db.contacts = db.contacts.filter(c => c.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 4. LEADS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT * FROM leads ORDER BY created_at DESC')) {
    return [...db.leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sqlNormalized.startsWith('INSERT INTO leads')) {
    const [first_name, last_name, status, email, phone, title, website, address, campaign] = params;
    const newId = db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) + 1 : 1;
    db.leads.push({ id: newId, first_name, last_name, status, email, phone, title, website, address, campaign, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE leads SET')) {
    const [first_name, last_name, status, email, phone, title, website, address, campaign, id] = params;
    db.leads = db.leads.map(l => l.id === parseInt(id, 10) ? { ...l, first_name, last_name, status, email, phone, title, website, address, campaign } : l);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM leads WHERE id = ?')) {
    const [id] = params;
    db.leads = db.leads.filter(l => l.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 5. OPPORTUNITIES QUERIES
  // --------------------------------------------------
  if (sqlNormalized.includes('FROM opportunities o LEFT JOIN accounts a ON o.account_id = a.id')) {
    return db.opportunities.map(o => {
      const acc = db.accounts.find(a => a.id === parseInt(o.account_id, 10));
      return { ...o, account_name: acc ? acc.name : null };
    }).sort((a, b) => new Date(a.close_date) - new Date(b.close_date));
  }
  if (sqlNormalized.startsWith('INSERT INTO opportunities')) {
    const [name, stage, amount, probability, currency, close_date, lead_source, account_id] = params;
    const newId = db.opportunities.length > 0 ? Math.max(...db.opportunities.map(o => o.id)) + 1 : 1;
    db.opportunities.push({ id: newId, name, stage, amount: parseFloat(amount), probability: parseInt(probability, 10), currency, close_date, lead_source, account_id: account_id ? parseInt(account_id, 10) : null, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE opportunities SET')) {
    const [name, stage, amount, probability, currency, close_date, lead_source, account_id, id] = params;
    db.opportunities = db.opportunities.map(o => o.id === parseInt(id, 10) ? { ...o, name, stage, amount: parseFloat(amount), probability: parseInt(probability, 10), currency, close_date, lead_source, account_id: account_id ? parseInt(account_id, 10) : null } : o);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM opportunities WHERE id = ?')) {
    const [id] = params;
    db.opportunities = db.opportunities.filter(o => o.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 6. TASKS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.includes('FROM tasks t LEFT JOIN users u ON t.assigned_user_id = u.id')) {
    return db.tasks.map(t => {
      const usr = db.users.find(u => u.id === parseInt(t.assigned_user_id, 10));
      return { ...t, assigned_user_name: usr ? usr.name : null };
    }).sort((a, b) => new Date(a.date_due) - new Date(b.date_due));
  }
  if (sqlNormalized.startsWith('INSERT INTO tasks')) {
    const [name, priority, status, date_due, assigned_user_id] = params;
    const newId = db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1;
    db.tasks.push({ id: newId, name, priority, status, date_due, assigned_user_id: assigned_user_id ? parseInt(assigned_user_id, 10) : null, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE tasks SET')) {
    const [name, priority, status, date_due, assigned_user_id, id] = params;
    db.tasks = db.tasks.map(t => t.id === parseInt(id, 10) ? { ...t, name, priority, status, date_due, assigned_user_id: assigned_user_id ? parseInt(assigned_user_id, 10) : null } : t);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM tasks WHERE id = ?')) {
    const [id] = params;
    db.tasks = db.tasks.filter(t => t.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 7. CALLS & MEETINGS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT * FROM calls ORDER BY date_start DESC')) {
    return [...db.calls].sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
  }
  if (sqlNormalized.startsWith('INSERT INTO calls')) {
    const [subject, status, date_start, duration, parent_type, parent_id] = params;
    const newId = db.calls.length > 0 ? Math.max(...db.calls.map(c => c.id)) + 1 : 1;
    db.calls.push({ id: newId, subject, status, date_start, duration: parseInt(duration, 10), parent_type, parent_id: parent_id ? parseInt(parent_id, 10) : null, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('DELETE FROM calls WHERE id = ?')) {
    const [id] = params;
    db.calls = db.calls.filter(c => c.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  if (sqlNormalized.startsWith('SELECT * FROM meetings ORDER BY date_start DESC')) {
    return [...db.meetings].sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
  }
  if (sqlNormalized.startsWith('INSERT INTO meetings')) {
    const [subject, status, date_start, duration, location] = params;
    const newId = db.meetings.length > 0 ? Math.max(...db.meetings.map(m => m.id)) + 1 : 1;
    db.meetings.push({ id: newId, subject, status, date_start, duration: parseInt(duration, 10), location, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('DELETE FROM meetings WHERE id = ?')) {
    const [id] = params;
    db.meetings = db.meetings.filter(m => m.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 8. CASES QUERIES
  // --------------------------------------------------
  if (sqlNormalized.includes('FROM cases c LEFT JOIN accounts a ON c.account_id = a.id')) {
    return db.cases.map(c => {
      const acc = db.accounts.find(a => a.id === parseInt(c.account_id, 10));
      return { ...c, account_name: acc ? acc.name : null };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sqlNormalized.startsWith('INSERT INTO cases')) {
    const [title, status, priority, description, account_id] = params;
    const newId = db.cases.length > 0 ? Math.max(...db.cases.map(c => c.id)) + 1 : 1;
    db.cases.push({ id: newId, title, status, priority, description, account_id: account_id ? parseInt(account_id, 10) : null, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE cases SET')) {
    const [title, status, priority, description, account_id, id] = params;
    db.cases = db.cases.map(c => c.id === parseInt(id, 10) ? { ...c, title, status, priority, description, account_id: account_id ? parseInt(account_id, 10) : null } : c);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM cases WHERE id = ?')) {
    const [id] = params;
    db.cases = db.cases.filter(c => c.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 9. KB ARTICLES QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT * FROM kb_articles ORDER BY category, title')) {
    return [...db.kb_articles].sort((a, b) => {
      const cat = a.category.localeCompare(b.category);
      if (cat !== 0) return cat;
      return a.title.localeCompare(b.title);
    });
  }
  if (sqlNormalized.startsWith('INSERT INTO kb_articles')) {
    const [title, category, content] = params;
    const newId = db.kb_articles.length > 0 ? Math.max(...db.kb_articles.map(k => k.id)) + 1 : 1;
    db.kb_articles.push({ id: newId, title, category, content, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }

  // --------------------------------------------------
  // 10. USERS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT id, username, email, name, role, team, created_at FROM users ORDER BY name')) {
    return db.users.map(u => ({ id: u.id, username: u.username, email: u.email, name: u.name, role: u.role, team: u.team, created_at: u.created_at }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sqlNormalized.startsWith('INSERT INTO users')) {
    const [username, password, email, name, role, team] = params;
    const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    db.users.push({ id: newId, username, password, email, name, role, team, created_at: new Date() });
    writeJsonDb(db);
    return { insertId: newId };
  }
  if (sqlNormalized.startsWith('UPDATE users SET')) {
    const [username, email, name, role, team, id] = params;
    db.users = db.users.map(u => u.id === parseInt(id, 10) ? { ...u, username, email, name, role, team } : u);
    writeJsonDb(db);
    return { affectedRows: 1 };
  }
  if (sqlNormalized.startsWith('DELETE FROM users WHERE id = ?')) {
    const [id] = params;
    db.users = db.users.filter(u => u.id !== parseInt(id, 10));
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  // --------------------------------------------------
  // 11. SETTINGS QUERIES
  // --------------------------------------------------
  if (sqlNormalized.startsWith('SELECT * FROM settings')) {
    return db.settings;
  }
  if (sqlNormalized.startsWith('INSERT INTO settings')) {
    const [name, value, updateValue] = params;
    const idx = db.settings.findIndex(s => s.name === name);
    if (idx !== -1) {
      db.settings[idx].value = updateValue;
    } else {
      const newId = db.settings.length > 0 ? Math.max(...db.settings.map(s => s.id)) + 1 : 1;
      db.settings.push({ id: newId, name, value });
    }
    writeJsonDb(db);
    return { affectedRows: 1 };
  }

  console.warn('UNMATCHED SQL QUERY IN JSON RUNNER:', sqlNormalized);
  return [];
}

// Helper to run queries (works for both MySQL and JSON file)
async function query(sql, params) {
  // Trigger pool initialization on the first query
  await getPool();

  if (useLocalJson) {
    return runJsonQuery(sql, params);
  }

  const activePool = await getPool();
  const [results] = await activePool.execute(sql, params);
  return results;
}

module.exports = {
  getPool,
  query
};
