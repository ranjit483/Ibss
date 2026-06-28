const fs = require('fs');
const path = require('path');
const { getPool, query } = require('./db');

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    const pool = await getPool();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL by semicolon, filtering out empty statements
    // We replace comment lines first to avoid issues
    const statements = schemaSql
      .replace(/--.*$/gm, '') // remove single-line comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} schema setup statements...`);
    
    // Get a single connection to run schema setup in order
    const connection = await pool.getConnection();
    try {
      for (const statement of statements) {
        await connection.query(statement);
      }
    } finally {
      connection.release();
    }
    
    console.log('Database tables created successfully.');

    // 1. Seed Users
    console.log('Seeding users...');
    await query(`
      INSERT INTO users (username, password, email, name, role, team) VALUES
      ('admin', 'admin123', 'admin@example.com', 'Alex Administrator', 'Admin', 'Management'),
      ('sarah_sales', 'sales123', 'sarah.s@example.com', 'Sarah Jenkins', 'User', 'Sales East'),
      ('john_sales', 'sales123', 'john.d@example.com', 'John Doe', 'User', 'Sales West'),
      ('manaraja', '1234@manaR#', 'ranjitmanaraja@gmail.com', 'Mana Raja', 'Admin', 'Management')
    `);

    // 2. Seed Accounts
    console.log('Seeding accounts...');
    await query(`
      INSERT INTO accounts (name, industry, website, phone, email, description) VALUES
      ('Apex Global Trading', 'Telecommunications', 'https://apexglobal.com', '+977-1-4412345', 'info@apexglobal.com', 'Major wholesale supplier in South Asia.'),
      ('Kathmandu Tech Hub', 'Technology', 'https://ktmtechhub.com.np', '+977-1-5543210', 'contact@ktmtechhub.com', 'Software development and IT consulting agency.'),
      ('Himalayan Organic Tea', 'Agriculture', 'https://himalayanorganic.com', '+977-61-520111', 'hello@himalayanorganic.com', 'Exporter of premium organic loose tea leaves.'),
      ('Sagarmatha Ventures', 'Financial Services', 'https://sagarmathaventures.com', '+977-1-4267890', 'invest@sagarmatha.com', 'Venture capital and private equity firm.')
    `);

    // 3. Seed Contacts
    console.log('Seeding contacts...');
    await query(`
      INSERT INTO contacts (first_name, last_name, account_id, email, phone, title) VALUES
      ('Rohan', 'Shrestha', 1, 'rohan@apexglobal.com', '+977-9851012345', 'Procurement Director'),
      ('Pooja', 'Adhikari', 2, 'pooja.a@ktmtechhub.com', '+977-9841324576', 'Chief Technology Officer'),
      ('Mingma', 'Sherpa', 3, 'mingma@himalayanorganic.com', '+977-9803112233', 'Operations Manager'),
      ('Sanjay', 'Thapa', 4, 'sanjay@sagarmathaventures.com', '+977-9851122334', 'Managing Partner')
    `);

    // 4. Seed Leads
    console.log('Seeding leads...');
    await query(`
      INSERT INTO leads (first_name, last_name, status, email, phone, title, website, address, campaign) VALUES
      ('Anil', 'Karki', 'New', 'anil.karki@outlook.com', '+977-9818765432', 'Business Development Manager', 'https://karkitraders.com', 'New Baneshwor, Kathmandu', 'Summer Expo 2026'),
      ('Deepa', 'Sharma', 'Assigned', 'deepa@sharmagroup.org', '+977-9849554433', 'Founder', 'https://sharmagroup.org', 'Lalitpur, Nepal', 'Google Search Ad'),
      ('Hari', 'Prasad', 'In Process', 'hari.prasad@gmail.com', '+977-9801122334', 'General Manager', '', 'Pokhara, Nepal', 'Cold Outreach'),
      ('Sunita', 'Tamang', 'Converted', 'sunita@tamangdesigns.com', '+977-9851088776', 'Creative Lead', 'https://tamangdesigns.com', 'Jhamsikhel, Lalitpur', 'Referral')
    `);

    // 5. Seed Opportunities
    console.log('Seeding opportunities...');
    await query(`
      INSERT INTO opportunities (name, stage, amount, probability, currency, close_date, lead_source, account_id) VALUES
      ('Enterprise Software Licensing', 'Negotiation', 1500000.00, 80, 'NPR', '2026-07-15', 'Google Search Ad', 2),
      ('Organic Tea Supply Contract', 'Proposal', 750000.00, 60, 'NPR', '2026-08-01', 'Referral', 3),
      ('Telecom Infrastructure Upgrade', 'Qualification', 4500000.00, 30, 'NPR', '2026-10-30', 'Cold Outreach', 1),
      ('Financial Advisory Partnership', 'Closed Won', 1200000.00, 100, 'NPR', '2026-06-20', 'Campaign', 4),
      ('Website Redesign Project', 'Prospecting', 350000.00, 10, 'NPR', '2026-09-15', 'Summer Expo 2026', 2)
    `);

    // 6. Seed Tasks
    console.log('Seeding tasks...');
    await query(`
      INSERT INTO tasks (name, priority, status, date_due, assigned_user_id) VALUES
      ('Send proposal for Enterprise Licensing', 'High', 'Started', '2026-06-30 17:00:00', 2),
      ('Follow up with Mingma on tea supply contract', 'Normal', 'Not Started', '2026-07-02 12:00:00', 3),
      ('Prepare presentation for Telecom Board', 'High', 'Not Started', '2026-07-10 10:00:00', 2),
      ('Review Q2 financial report', 'Normal', 'Completed', '2026-06-25 18:00:00', 1)
    `);

    // 7. Seed Calls
    console.log('Seeding calls...');
    await query(`
      INSERT INTO calls (subject, status, date_start, duration, parent_type, parent_id) VALUES
      ('Introductory Call - Anil Karki', 'Held', '2026-06-28 10:30:00', 15, 'Lead', 1),
      ('Contract Discussion - Rohan Shrestha', 'Planned', '2026-06-29 11:00:00', 30, 'Contact', 1),
      ('Technical Requirements - Pooja Adhikari', 'Planned', '2026-06-30 14:00:00', 45, 'Contact', 2)
    `);

    // 8. Seed Meetings
    console.log('Seeding meetings...');
    await query(`
      INSERT INTO meetings (subject, status, date_start, duration, location) VALUES
      ('Discovery Meeting with Kathmandu Tech Hub', 'Held', '2026-06-27 14:00:00', 60, 'KTM Tech Hub HQ, Pulchowk'),
      ('Partnership Negotiation - Sagarmatha Ventures', 'Planned', '2026-07-01 15:00:00', 90, 'Virtual - Zoom Link'),
      ('Quarterly Sales Review', 'Planned', '2026-07-05 09:00:00', 120, 'Main Conference Room')
    `);

    // 9. Seed Cases
    console.log('Seeding cases...');
    await query(`
      INSERT INTO cases (title, status, priority, description, account_id) VALUES
      ('Cannot access client portal', 'In Process', 'High', 'Client Pooja from KTM Tech Hub receives a 403 Forbidden error when trying to access the shared portal.', 2),
      ('Incorrect invoice amount', 'New', 'Normal', 'Himalayan Organic Tea reports they were billed for 500kg instead of 450kg.', 3),
      ('API Integration Timeout', 'Closed', 'High', 'Apex Global reported webhook timeouts on Friday afternoon. Resolved by increasing timeout limit.', 1)
    `);

    // 10. Seed KB Articles
    console.log('Seeding knowledge base...');
    await query(`
      INSERT INTO kb_articles (title, category, content) VALUES
      ('How to reset your portal password', 'Account Management', 'To reset your portal password, go to the login screen and click \"Forgot Password\". Enter your email address and follow the link sent to your inbox. Passwords must be at least 8 characters long and contain one number and symbol.'),
      ('Understanding Opportunity Stages', 'Sales Process', 'Our sales process consists of 5 stages:\n1. Prospecting (10% probability)\n2. Qualification (30% probability)\n3. Proposal (60% probability)\n4. Negotiation (80% probability)\n5. Closed Won (100% probability).\nEnsure opportunities are moved promptly to reflect accurate pipeline forecasting.'),
      ('Configuring Webhooks', 'Integrations', 'Webhooks can be configured in Administration -> Setup & Data -> Webhooks. Enter the payload URL and select the events you wish to subscribe to (e.g. Lead Created, Opportunity Won). Payloads are sent as JSON POST requests.')
    `);

    // 11. Seed Settings
    console.log('Seeding settings...');
    await query(`
      INSERT INTO settings (name, value) VALUES
      ('theme', 'dark'),
      ('company_name', 'EspoCRM Nepal'),
      ('default_currency', 'NPR')
    `);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
