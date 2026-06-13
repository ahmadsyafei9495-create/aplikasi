require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth
app.post('/api/auth/login', async (req, res) => {
  const schema = Joi.object({ username: Joi.string().required(), password: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { username, password } = value;
  const row = db.prepare('SELECT id, username, password, role FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(row);
  res.json({ token, user: { id: row.id, username: row.username, role: row.role } });
});

// Announcements
app.get('/api/announcements', (req, res) => {
  const rows = db.prepare('SELECT id, title, content, created_at FROM announcements ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const schema = Joi.object({ title: Joi.string().required(), content: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const info = db.prepare('INSERT INTO announcements (title, content) VALUES (?, ?)').run(value.title, value.content);
  const row = db.prepare('SELECT id, title, content, created_at FROM announcements WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// Students
app.get('/api/students', (req, res) => {
  const rows = db.prepare('SELECT id, nis, name, class, created_at FROM students ORDER BY name').all();
  res.json(rows);
});

app.post('/api/students', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const schema = Joi.object({ nis: Joi.string().required(), name: Joi.string().required(), class: Joi.string().allow('', null) });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  try {
    const info = db.prepare('INSERT INTO students (nis, name, class) VALUES (?, ?, ?)').run(value.nis, value.name, value.class);
    const row = db.prepare('SELECT id, nis, name, class, created_at FROM students WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: 'NIS mungkin sudah terdaftar' });
  }
});

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
