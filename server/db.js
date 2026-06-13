const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(dbPath);

function init() {
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nis TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      class TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin if not exists
  const row = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!row) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  }

  // Sample announcement
  const a = db.prepare('SELECT id FROM announcements LIMIT 1').get();
  if (!a) {
    db.prepare('INSERT INTO announcements (title, content) VALUES (?, ?)').run('Selamat Datang', 'Selamat datang di SMA NEGERI 1!');
  }

  // Sample student
  const s = db.prepare('SELECT id FROM students LIMIT 1').get();
  if (!s) {
    db.prepare('INSERT INTO students (nis, name, class) VALUES (?, ?, ?)').run('123456', 'Ahmad S.', '12 IPA');
  }
}

init();

module.exports = db;
