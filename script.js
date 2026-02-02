document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const programForm = document.getElementById('programForm');
  const programName = document.getElementById('programName');
  const programDuration = document.getElementById('programDuration');
  const programList = document.getElementById('programList');
  const programSearch = document.getElementById('programSearch');

  const leadForm = document.getElementById('leadForm');
  const leadName = document.getElementById('leadName');
  const leadEmail = document.getElementById('leadEmail');
  const leadStatus = document.getElementById('leadStatus');
  const leadList = document.getElementById('leadList');
  const leadSearch = document.getElementById('leadSearch');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  const modalCancel = document.getElementById('modalCancel');
  const modalSave = document.getElementById('modalSave');

  const themeToggle = document.getElementById('themeToggle');

  let programs = JSON.parse(localStorage.getItem('programs')) || [];
  let leads = JSON.parse(localStorage.getItem('leads')) || [];
  let editing = null; // {type, id}

  // Add sample data if empty (helps demonstrate features)
  if (!programs.length) {
    programs.push({ id: Date.now(), name: 'Confidence Bootcamp', duration: '8 weeks', created: new Date().toISOString() });
  }
  if (!leads.length) {
    leads.push({ id: Date.now() + 1, name: 'Jane Doe', email: 'jane@example.com', status: 'New', created: new Date().toISOString() });
  }
  persist();

  // Theme
  applyTheme(localStorage.getItem('theme') || 'light');

  // Helpers
  function persist() {
    localStorage.setItem('programs', JSON.stringify(programs));
    localStorage.setItem('leads', JSON.stringify(leads));
  }

  function escapeHtml(str){
    if(!str) return '';
    return String(str).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
  }

  function renderPrograms(filter = ''){
    programList.innerHTML = '';
    const items = programs.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    if(!items.length) { programList.innerHTML = '<li class="empty">No programs found</li>'; return }
    items.forEach(p => {
      const li = document.createElement('li'); li.className='item'; li.dataset.id = p.id; li.tabIndex = 0; /* keyboard focusable */
      li.innerHTML = `
        <div class="item-main">
          <strong class="item-title">${escapeHtml(p.name)}</strong>
          <span class="muted">${escapeHtml(p.duration)}</span>
        </div>
        <div class="item-actions">
          <button class="btn small" data-action="edit-program" data-id="${p.id}">Edit</button>
          <button class="btn small danger" data-action="delete-program" data-id="${p.id}">Delete</button>
        </div>`;
      programList.appendChild(li);
    });
  }

  function renderLeads(filter = ''){
    leadList.innerHTML = '';
    const items = leads.filter(l => l.name.toLowerCase().includes(filter.toLowerCase()) || l.email.toLowerCase().includes(filter.toLowerCase()));
    if(!items.length) { leadList.innerHTML = '<li class="empty">No leads found</li>'; return }
    items.forEach(l => {
      const li = document.createElement('li'); li.className='item'; li.dataset.id = l.id; li.tabIndex = 0; /* keyboard focusable */
      li.innerHTML = `
        <div class="item-main">
          <strong class="item-title">${escapeHtml(l.name)}</strong>
          <span class="muted">${escapeHtml(l.email)}</span>
          <span class="badge status-${escapeHtml(l.status.toLowerCase())}">${escapeHtml(l.status)}</span>
        </div>
        <div class="item-actions">
          <button class="btn small" data-action="edit-lead" data-id="${l.id}">Edit</button>
          <button class="btn small danger" data-action="delete-lead" data-id="${l.id}">Delete</button>
        </div>`;
      leadList.appendChild(li);
    });
  }

  // helper to highlight a newly added item
  function highlightListItem(listEl, id){
    const el = listEl.querySelector('li[data-id="'+id+'"]');
    if(el){ el.classList.add('added'); el.scrollIntoView({behavior:'smooth', block:'center'}); setTimeout(()=> el.classList.remove('added'),700); }
  }

  // Forms
  programForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = programName.value.trim();
    const duration = programDuration.value.trim();
    if(!name || !duration) { alert('Please enter program name and duration'); return }
    const id = Date.now();
    programs.push({ id, name, duration, created: new Date().toISOString() });
    programName.value = '';
    programDuration.value = '';
    persist(); renderPrograms(programSearch.value || '');
    highlightListItem(programList, id);
  });

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = leadName.value.trim();
    const email = leadEmail.value.trim();
    const status = leadStatus.value;
    if(!name || !email) { alert('Please enter name and email'); return }
    const id = Date.now();
    leads.push({ id, name, email, status, created: new Date().toISOString() });
    leadName.value = '';
    leadEmail.value = '';
    leadStatus.value = 'New';
    persist(); renderLeads(leadSearch.value || '');
    highlightListItem(leadList, id);
  });

  // Search
  programSearch.addEventListener('input', () => renderPrograms(programSearch.value));
  leadSearch.addEventListener('input', () => renderLeads(leadSearch.value));

  // Delegated actions
  programList.addEventListener('click', handleListActions);
  leadList.addEventListener('click', handleListActions);

  function handleListActions(e){
    const btn = e.target.closest('button'); if(!btn) return;
    const action = btn.dataset.action; const id = Number(btn.dataset.id);
    if(action === 'delete-program') deleteProgram(id);
    if(action === 'edit-program') openEdit('program', id);

    if(action === 'delete-lead') deleteLead(id);
    if(action === 'edit-lead') openEdit('lead', id);
  }

  // CRUD helpers
  function deleteProgram(id){
    if(!confirm('Delete this program?')) return;
    programs = programs.filter(p => p.id !== id);
    persist(); renderPrograms(programSearch.value || '');
  }
  function deleteLead(id){
    if(!confirm('Delete this lead?')) return;
    leads = leads.filter(l => l.id !== id);
    persist(); renderLeads(leadSearch.value || '');
  }

  function openEdit(type, id){
    editing = { type, id };
    modalForm.innerHTML = '';
    if(type === 'program'){
      const p = programs.find(x => x.id === id); if(!p) return;
      modalTitle.textContent = 'Edit Program';
      modalForm.innerHTML = `
        <label>Program name<br><input id="m_name" value="${escapeHtml(p.name)}"></label>
        <label>Duration<br><input id="m_duration" value="${escapeHtml(p.duration)}"></label>
      `;
    } else {
      const l = leads.find(x => x.id === id); if(!l) return;
      modalTitle.textContent = 'Edit Lead';
      modalForm.innerHTML = `
        <label>Name<br><input id="m_name" value="${escapeHtml(l.name)}"></label>
        <label>Email<br><input id="m_email" value="${escapeHtml(l.email)}"></label>
        <label>Status<br><select id="m_status"><option${l.status==='New'? ' selected':''}>New</option><option${l.status==='Contacted'?' selected':''}>Contacted</option><option${l.status==='Enrolled'?' selected':''}>Enrolled</option></select></label>
      `;
    }
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  }

  modalCancel.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  modalSave.addEventListener('click', (e) => {
    e.preventDefault(); if(!editing) return;
    if(editing.type === 'program'){
      const name = document.getElementById('m_name').value.trim();
      const duration = document.getElementById('m_duration').value.trim();
      if(!name || !duration) { alert('Please enter both fields'); return }
      programs = programs.map(p => p.id === editing.id ? Object.assign({}, p, { name, duration }) : p);
      persist(); renderPrograms(programSearch.value || '');
    } else {
      const name = document.getElementById('m_name').value.trim();
      const email = document.getElementById('m_email').value.trim();
      const status = document.getElementById('m_status').value;
      if(!name || !email) { alert('Please enter name and email'); return }
      leads = leads.map(l => l.id === editing.id ? Object.assign({}, l, { name, email, status }) : l);
      persist(); renderLeads(leadSearch.value || '');
    }
    closeModal();
  });

  function closeModal(){ editing = null; modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); }

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  function toggleTheme(){ const next = document.body.classList.contains('dark') ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('theme', next); }
  function applyTheme(name){
    if(name === 'dark') document.body.classList.add('dark'); else document.body.classList.remove('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    // Keep the toggle visually 'pressed' when the theme is active
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // Initial render
  renderPrograms(); renderLeads();

  // Initialize clear buttons to show/hide and clear inputs
  function initClearButtons(){
    document.querySelectorAll('.input-group').forEach(group => {
      const input = group.querySelector('input, textarea, select');
      const btn = group.querySelector('.input-clear');
      if(!btn || !input) return;
      function update(){
        if(input.value && String(input.value).trim() !== '') group.classList.add('has-value'); else group.classList.remove('has-value');
      }
      input.addEventListener('input', update);
      btn.addEventListener('click', (e) => { e.preventDefault(); input.value = ''; input.focus(); update(); input.dispatchEvent(new Event('input')) });
      update();
    });
  }

  initClearButtons();

  // Global clear filters button
  const clearFiltersBtn = document.getElementById('clearFilters');
  if(clearFiltersBtn){
    clearFiltersBtn.addEventListener('click', () => {
      programSearch.value = '';
      leadSearch.value = '';
      programSearch.dispatchEvent(new Event('input'));
      leadSearch.dispatchEvent(new Event('input'));
      programSearch.focus();
      initClearButtons();
    });
  }

  // Keyboard shortcut: Ctrl/⌘ + K focuses first search box
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      const s = document.querySelector('.search');
      if(s){ s.focus(); if(s.select) s.select(); }
    }
  });
});