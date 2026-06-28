const express = require('express');
const cors = require('cors');
const { query } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'EspoCRM Backend API is running.' });
});

// ==========================================
// AUTHENTICATION ENDPOINT
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    // Note: In a production app, we would use bcrypt.compare() here.
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create initials for the UI avatar
    const nameParts = user.name.split(' ');
    let initials = nameParts[0][0];
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1][0];
    }
    
    // Return sanitized user object
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      initials: initials.toUpperCase()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DASHBOARD ENDPOINT
// ==========================================
app.get('/api/dashboard', async (req, res) => {
  try {
    // 1. Get counts
    const leadCount = await query('SELECT COUNT(*) as count FROM leads');
    const opportunityCount = await query('SELECT COUNT(*) as count FROM opportunities');
    const taskCount = await query("SELECT COUNT(*) as count FROM tasks WHERE status != 'Completed'");
    const caseCount = await query("SELECT COUNT(*) as count FROM cases WHERE status != 'Closed'");
    
    // 2. Get revenue sum (Closed Won)
    const revenue = await query("SELECT SUM(amount) as total FROM opportunities WHERE stage = 'Closed Won'");

    // 3. Get pipeline stages for chart
    const pipeline = await query(`
      SELECT stage, COUNT(*) as count, SUM(amount) as value 
      FROM opportunities 
      GROUP BY stage
    `);

    // 4. Get recent activities (combined Calls, Meetings, Tasks)
    const recentCalls = await query('SELECT id, subject as title, date_start as date, \'Call\' as type, status FROM calls ORDER BY date_start DESC LIMIT 3');
    const recentMeetings = await query('SELECT id, subject as title, date_start as date, \'Meeting\' as type, status FROM meetings ORDER BY date_start DESC LIMIT 3');
    const recentTasks = await query('SELECT id, name as title, date_due as date, \'Task\' as type, status FROM tasks WHERE status != \'Completed\' ORDER BY date_due ASC LIMIT 3');

    const activities = [...recentCalls, ...recentMeetings, ...recentTasks]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      stats: {
        leads: leadCount[0].count,
        opportunities: opportunityCount[0].count,
        tasks: taskCount[0].count,
        cases: caseCount[0].count,
        revenue: revenue[0].total || 0
      },
      pipeline,
      activities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ACCOUNTS ENDPOINTS
// ==========================================
app.get('/api/accounts', async (req, res) => {
  try {
    const data = await query('SELECT * FROM accounts ORDER BY name');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/accounts', async (req, res) => {
  const { name, industry, website, phone, email, description } = req.body;
  try {
    const result = await query(
      'INSERT INTO accounts (name, industry, website, phone, email, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, industry, website, phone, email, description]
    );
    res.status(201).json({ id: result.insertId, name, industry, website, phone, email, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, website, phone, email, description } = req.body;
  try {
    await query(
      'UPDATE accounts SET name = ?, industry = ?, website = ?, phone = ?, email = ?, description = ? WHERE id = ?',
      [name, industry, website, phone, email, description, id]
    );
    res.json({ id, name, industry, website, phone, email, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM accounts WHERE id = ?', [id]);
    res.json({ message: 'Account deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CONTACTS ENDPOINTS
// ==========================================
app.get('/api/contacts', async (req, res) => {
  try {
    const data = await query(`
      SELECT c.*, a.name as account_name 
      FROM contacts c 
      LEFT JOIN accounts a ON c.account_id = a.id 
      ORDER BY c.last_name, c.first_name
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { first_name, last_name, account_id, email, phone, title } = req.body;
  try {
    const result = await query(
      'INSERT INTO contacts (first_name, last_name, account_id, email, phone, title) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, account_id || null, email, phone, title]
    );
    res.status(201).json({ id: result.insertId, first_name, last_name, account_id, email, phone, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, account_id, email, phone, title } = req.body;
  try {
    await query(
      'UPDATE contacts SET first_name = ?, last_name = ?, account_id = ?, email = ?, phone = ?, title = ? WHERE id = ?',
      [first_name, last_name, account_id || null, email, phone, title, id]
    );
    res.json({ id, first_name, last_name, account_id, email, phone, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ message: 'Contact deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LEADS ENDPOINTS
// ==========================================
app.get('/api/leads', async (req, res) => {
  try {
    const data = await query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  const { first_name, last_name, status, email, phone, title, website, address, campaign } = req.body;
  try {
    const result = await query(
      'INSERT INTO leads (first_name, last_name, status, email, phone, title, website, address, campaign) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, status || 'New', email, phone, title, website, address, campaign]
    );
    res.status(201).json({ id: result.insertId, first_name, last_name, status, email, phone, title, website, address, campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, status, email, phone, title, website, address, campaign } = req.body;
  try {
    await query(
      'UPDATE leads SET first_name = ?, last_name = ?, status = ?, email = ?, phone = ?, title = ?, website = ?, address = ?, campaign = ? WHERE id = ?',
      [first_name, last_name, status, email, phone, title, website, address, campaign, id]
    );
    res.json({ id, first_name, last_name, status, email, phone, title, website, address, campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM leads WHERE id = ?', [id]);
    res.json({ message: 'Lead deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// OPPORTUNITIES ENDPOINTS
// ==========================================
app.get('/api/opportunities', async (req, res) => {
  try {
    const data = await query(`
      SELECT o.*, a.name as account_name 
      FROM opportunities o 
      LEFT JOIN accounts a ON o.account_id = a.id 
      ORDER BY o.close_date ASC
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/opportunities', async (req, res) => {
  const { name, stage, amount, probability, currency, close_date, lead_source, account_id } = req.body;
  try {
    const result = await query(
      'INSERT INTO opportunities (name, stage, amount, probability, currency, close_date, lead_source, account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, stage || 'Prospecting', amount || 0.00, probability || 0, currency || 'NPR', close_date, lead_source, account_id || null]
    );
    res.status(201).json({ id: result.insertId, name, stage, amount, probability, currency, close_date, lead_source, account_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  const { name, stage, amount, probability, currency, close_date, lead_source, account_id } = req.body;
  try {
    await query(
      'UPDATE opportunities SET name = ?, stage = ?, amount = ?, probability = ?, currency = ?, close_date = ?, lead_source = ?, account_id = ? WHERE id = ?',
      [name, stage, amount, probability, currency, close_date, lead_source, account_id || null, id]
    );
    res.json({ id, name, stage, amount, probability, currency, close_date, lead_source, account_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM opportunities WHERE id = ?', [id]);
    res.json({ message: 'Opportunity deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// TASKS ENDPOINTS
// ==========================================
app.get('/api/tasks', async (req, res) => {
  try {
    const data = await query(`
      SELECT t.*, u.name as assigned_user_name 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_user_id = u.id 
      ORDER BY t.date_due ASC
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { name, priority, status, date_due, assigned_user_id } = req.body;
  try {
    const result = await query(
      'INSERT INTO tasks (name, priority, status, date_due, assigned_user_id) VALUES (?, ?, ?, ?, ?)',
      [name, priority || 'Normal', status || 'Not Started', date_due, assigned_user_id || null]
    );
    res.status(201).json({ id: result.insertId, name, priority, status, date_due, assigned_user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, priority, status, date_due, assigned_user_id } = req.body;
  try {
    await query(
      'UPDATE tasks SET name = ?, priority = ?, status = ?, date_due = ?, assigned_user_id = ? WHERE id = ?',
      [name, priority, status, date_due, assigned_user_id || null, id]
    );
    res.json({ id, name, priority, status, date_due, assigned_user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CALLS ENDPOINTS
// ==========================================
app.get('/api/calls', async (req, res) => {
  try {
    const data = await query('SELECT * FROM calls ORDER BY date_start DESC');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/calls', async (req, res) => {
  const { subject, status, date_start, duration, parent_type, parent_id } = req.body;
  try {
    const result = await query(
      'INSERT INTO calls (subject, status, date_start, duration, parent_type, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
      [subject, status || 'Planned', date_start, duration || 15, parent_type, parent_id || null]
    );
    res.status(201).json({ id: result.insertId, subject, status, date_start, duration, parent_type, parent_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calls/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM calls WHERE id = ?', [id]);
    res.json({ message: 'Call deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MEETINGS ENDPOINTS
// ==========================================
app.get('/api/meetings', async (req, res) => {
  try {
    const data = await query('SELECT * FROM meetings ORDER BY date_start DESC');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meetings', async (req, res) => {
  const { subject, status, date_start, duration, location } = req.body;
  try {
    const result = await query(
      'INSERT INTO meetings (subject, status, date_start, duration, location) VALUES (?, ?, ?, ?, ?)',
      [subject, status || 'Planned', date_start, duration || 30, location]
    );
    res.status(201).json({ id: result.insertId, subject, status, date_start, duration, location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/meetings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM meetings WHERE id = ?', [id]);
    res.json({ message: 'Meeting deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CASES ENDPOINTS
// ==========================================
app.get('/api/cases', async (req, res) => {
  try {
    const data = await query(`
      SELECT c.*, a.name as account_name 
      FROM cases c 
      LEFT JOIN accounts a ON c.account_id = a.id 
      ORDER BY c.created_at DESC
    `);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  const { title, status, priority, description, account_id } = req.body;
  try {
    const result = await query(
      'INSERT INTO cases (title, status, priority, description, account_id) VALUES (?, ?, ?, ?, ?)',
      [title, status || 'New', priority || 'Normal', description, account_id || null]
    );
    res.status(201).json({ id: result.insertId, title, status, priority, description, account_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id', async (req, res) => {
  const { id } = req.params;
  const { title, status, priority, description, account_id } = req.body;
  try {
    await query(
      'UPDATE cases SET title = ?, status = ?, priority = ?, description = ?, account_id = ? WHERE id = ?',
      [title, status, priority, description, account_id || null, id]
    );
    res.json({ id, title, status, priority, description, account_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM cases WHERE id = ?', [id]);
    res.json({ message: 'Case deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// KNOWLEDGE BASE ENDPOINTS
// ==========================================
app.get('/api/kb', async (req, res) => {
  try {
    const data = await query('SELECT * FROM kb_articles ORDER BY category, title');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kb', async (req, res) => {
  const { title, category, content } = req.body;
  try {
    const result = await query(
      'INSERT INTO kb_articles (title, category, content) VALUES (?, ?, ?)',
      [title, category, content]
    );
    res.status(201).json({ id: result.insertId, title, category, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// USERS ENDPOINTS
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const data = await query('SELECT id, username, email, name, role, team, password, created_at FROM users ORDER BY name');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, email, name, role, team } = req.body;
  try {
    const result = await query(
      'INSERT INTO users (username, password, email, name, role, team) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password || 'user123', email, name, role || 'User', team || 'Sales']
    );
    res.status(201).json({ id: result.insertId, username, email, name, role, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, name, role, team } = req.body;
  try {
    await query(
      'UPDATE users SET username = ?, email = ?, name = ?, role = ?, team = ? WHERE id = ?',
      [username, email, name, role, team, id]
    );
    res.json({ id, username, email, name, role, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const data = await query('SELECT * FROM settings');
    // Convert array to key-value object
    const settingsObj = {};
    data.forEach(row => {
      settingsObj[row.name] = row.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const settings = req.body; // e.g. { theme: 'dark', company_name: 'My CRM' }
  try {
    for (const [key, value] of Object.entries(settings)) {
      await query(
        'INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, value, value]
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SERVE FRONTEND (FOR PRODUCTION)
// ==========================================
const path = require('path');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Serve static files from the React app
app.use(express.static(frontendDistPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`EspoCRM Backend Server running on port ${PORT}`);
});
