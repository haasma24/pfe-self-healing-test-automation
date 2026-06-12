function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  currentProduct = p; modalQty = 1;
  if (!recentlyViewed.find(x => x.id === id)) {
    recentlyViewed.unshift({...p});
    if (recentlyViewed.length > 6) recentlyViewed.pop();
    renderRecentlyViewed();
  }
  document.getElementById('modal-emoji').textContent = p.emoji;
  document.getElementById('modal-category').textContent = p.cat;
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-desc').textContent = p.desc;
  document.getElementById('modal-price').innerHTML = `$${p.price.toFixed(2)} ${p.orig ? `<span style="font-size:.9rem;color:var(--muted);text-decoration:line-through;font-family:'DM Mono',monospace">$${p.orig.toFixed(2)}</span>` : ''}`;
  document.getElementById('modal-qty-val').textContent = '1';

  const specs = document.getElementById('modal-specs-table');
  specs.innerHTML = Object.entries(p.specs || {}).map(([k,v]) => `<tr><td style="color:var(--muted);padding:.3rem 0;font-size:.8rem">${k}</td><td style="font-family:'DM Mono',monospace;font-size:.8rem;padding:.3rem 0">${v}</td></tr>`).join('');

  const revList = document.getElementById('modal-reviews-list');
  revList.innerHTML = (p.reviewList||[]).map(r => `
    <div class="review-item">
      <div class="review-header">
        <span class="reviewer-name">${r.user}</span>
        <span class="review-date">${r.date}</span>
      </div>
      <div style="color:var(--accent);font-size:.75rem;margin-bottom:.25rem">${'★'.repeat(r.rating)}</div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');

  document.getElementById('modal-size-picker').style.display = p.cat === 'Apparel' ? '' : 'none';
  switchModalTab(document.querySelector('.modal-tab-btn'), 'desc');
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(event) {
  if (!event || event.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
}

function adjustQty(delta) { modalQty = Math.max(1, modalQty + delta); document.getElementById('modal-qty-val').textContent = modalQty; }

function modalAddToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, modalQty);
  closeModal({target:null});
  openCart();
}

function switchModalTab(el, tab) {
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  const content = document.getElementById(`modal-tab-${tab}`);
  if (content) content.classList.add('active');
}
