-- Create database if not exists
CREATE DATABASE IF NOT EXISTS espo_crm;
USE espo_crm;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS kb_articles;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS calls;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'User', -- 'Admin', 'User'
  team VARCHAR(100) DEFAULT 'Sales',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  account_id INT,
  email VARCHAR(100),
  phone VARCHAR(50),
  title VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Leads table
CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'New', -- 'New', 'Assigned', 'In Process', 'Converted'
  email VARCHAR(100),
  phone VARCHAR(50),
  title VARCHAR(100),
  website VARCHAR(255),
  address VARCHAR(255),
  campaign VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities table
CREATE TABLE opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  stage VARCHAR(50) DEFAULT 'Prospecting', -- 'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'
  amount DECIMAL(15, 2) DEFAULT 0.00,
  probability INT DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NPR',
  close_date DATE,
  lead_source VARCHAR(100),
  account_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Tasks table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Normal', -- 'Normal', 'High'
  status VARCHAR(20) DEFAULT 'Not Started', -- 'Not Started', 'Started', 'Completed'
  date_due DATETIME,
  assigned_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Calls table
CREATE TABLE calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Planned', -- 'Planned', 'Held', 'Missed'
  date_start DATETIME,
  duration INT DEFAULT 15, -- in minutes
  parent_type VARCHAR(50), -- 'Lead', 'Contact', 'Account'
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE meetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Planned', -- 'Planned', 'Held', 'Not Held'
  date_start DATETIME,
  duration INT DEFAULT 30, -- in minutes
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases table
CREATE TABLE cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'New', -- 'New', 'Assigned', 'In Process', 'Closed'
  priority VARCHAR(20) DEFAULT 'Normal', -- 'Low', 'Normal', 'High'
  description TEXT,
  account_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Knowledge Base articles table
CREATE TABLE kb_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT
);
