const api = {
  announcements: '/api/announcements',
  students: '/api/students',
  login: '/api/auth/login'
};

async function fetchAnnouncements() {
  const res = await fetch(api.announcements);
  return res.json();
}

async function fetchStudents() {
  const res = await fetch(api.students);
  return res.json();
}

function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}

async function renderHome() {
  const list = document.getElementById('list');
  const studentsList = document.getElementById('students-list');
  if (!list) return;
  list.innerHTML = 'Loading...';
  const anns = await fetchAnnouncements();
  list.innerHTML = '';
  anns.forEach(a => {
    const card = el('div', 'bg-white p-4 rounded shadow');
    card.appendChild(el('h3', 'font-semibold text-lg', a.title));
    card.appendChild(el('p', 'text-sm text-gray-700 mt-2', a.content));
    card.appendChild(el('div', 'text-xs text-gray-500 mt-2', new Date(a.created_at).toLocaleString()));
    list.appendChild(card);
  });

  studentsList.innerHTML = '';
  const students = await fetchStudents();
  students.forEach(s => {
    const card = el('div', 'bg-white p-4 rounded shadow');
    card.appendChild(el('h3', 'font-semibold', s.name));
    card.appendChild(el('p', 'text-sm text-gray-700', `NIS: ${s.nis}`));
    card.appendChild(el('p', 'text-sm text-gray-500 mt-2', s.class || '')); 
    studentsList.appendChild(card);
  });
}

// Admin
function saveToken(t) { localStorage.setItem('sma_token', t); }
function loadToken() { return localStorage.getItem('sma_token'); }
function authHeaders() { const t = loadToken(); return t ? { Authorization: 'Bearer ' + t } : {}; }

async function adminLogin() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const res = await fetch(api.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('login-msg').textContent = data.error || 'Gagal';
    return;
  }
  saveToken(data.token);
  showAdminArea();
}

async function createAnnouncement() {
  const title = document.getElementById('ann-title').value;
  const content = document.getElementById('ann-content').value;
  const res = await fetch(api.announcements, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()), body: JSON.stringify({ title, content }) });
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('ann-msg').textContent = data.error || 'Gagal';
    return;
  }
  document.getElementById('ann-msg').textContent = 'Pengumuman dibuat.';
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-content').value = '';
  await renderHome();
}

function logout() { localStorage.removeItem('sma_token'); location.reload(); }

function showAdminArea() {
  document.getElementById('login-panel').classList.add('hidden');
  document.getElementById('admin-area').classList.remove('hidden');
}

async function initAdmin() {
  const btn = document.getElementById('btn-login');
  if (btn) btn.addEventListener('click', adminLogin);
  const btnCreate = document.getElementById('btn-create-ann');
  if (btnCreate) btnCreate.addEventListener('click', createAnnouncement);
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', logout);

  if (loadToken()) showAdminArea();
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  initAdmin();
});
