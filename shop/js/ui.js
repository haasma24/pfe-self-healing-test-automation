function showToast(msg, type='success') {
  const c = document.getElementById('toast-container');
  const icon = type === 'success' ? '✅' : '❌';
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.setAttribute('data-testid','toast-notification');
  t.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function renderRecentlyViewed() {
  const sec = document.getElementById('recently-viewed-section');
  if (!recentlyViewed.length) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  document.getElementById('rv-grid').innerHTML = recentlyViewed.map(p => `
    <div class="rv-card" onclick="openModal(${p.id})">
      <div class="rv-card-emoji">${p.emoji}</div>
      <div class="rv-card-name">${p.name}</div>
      <div class="rv-card-price">$${p.price.toFixed(2)}</div>
    </div>`).join('');
}

function handleNewsletter() {
  const email = document.getElementById('newsletter-email').value;
  if (!email || !email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
  showToast('Subscribed! Welcome to the community 🎉', 'success');
  document.getElementById('newsletter-email').value = '';
}

function starsHtml(r) {
  const full = Math.floor(r), half = r % 1 >= .5;
  return '★'.repeat(full) + (half ? '½' : '');
}

function openSearchModal() { document.getElementById('search-modal').classList.add('open'); updateSearchModal(''); setTimeout(() => document.getElementById('search-modal-input').focus(), 100); }
function closeSearchModal() { document.getElementById('search-modal').classList.remove('open'); }

function updateSearchModal(val) {
  const q = val.toLowerCase();
  const filtered = q.length > 0 ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)) : PRODUCTS.slice(0,8);
  document.getElementById('search-modal-results').innerHTML = filtered.map(p => `
    <div class="search-result-item" onclick="closeSearchModal();openModal(${p.id})">
      <span class="search-result-emoji">${p.emoji}</span>
      <div class="search-result-info">
        <div class="search-result-name">${p.name}</div>
        <div class="search-result-cat">${p.cat}</div>
      </div>
      <span class="search-result-price">$${p.price.toFixed(2)}</span>
    </div>`).join('');
}

function quickSearch(q) { document.getElementById('search-modal-input').value = q; updateSearchModal(q); }

let countdown = 3 * 3600 - 13;
function updateCountdown() {
  if (countdown <= 0) { countdown = 3*3600; }
  countdown--;
  const h = Math.floor(countdown/3600);
  const m = Math.floor((countdown%3600)/60);
  const s = countdown%60;
  const el = document.getElementById('promo-countdown');
  if (el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
setInterval(updateCountdown, 1000);
