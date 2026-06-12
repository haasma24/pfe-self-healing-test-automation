function handleSearch(val) {
  const q = val.toLowerCase();
  const filtered = q ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)) : PRODUCTS;
  renderProducts(filtered);
  document.getElementById('count-shown').textContent = filtered.length;
}

function handleSort(val) {
  let sorted = [...PRODUCTS];
  if (val === 'price-asc') sorted.sort((a,b) => a.price-b.price);
  else if (val === 'price-desc') sorted.sort((a,b) => b.price-a.price);
  else if (val === 'newest') sorted.sort((a,b) => b.id-a.id);
  else if (val === 'rating') sorted.sort((a,b) => b.rating-a.rating);
  else if (val === 'popular') sorted.sort((a,b) => b.reviews-a.reviews);
  renderProducts(sorted);
}

function applyFilters() {
  const maxPrice = parseFloat(document.getElementById('price-range').value);
  const minRating = parseFloat(document.querySelector('input[name="rating"]:checked').value);
  const onSale = document.getElementById('chk-on-sale').checked;
  const filtered = PRODUCTS.filter(p => {
    if (p.price > maxPrice) return false;
    if (p.rating < minRating) return false;
    if (onSale && !p.orig) return false;
    return true;
  });
  renderProducts(filtered);
  document.getElementById('count-shown').textContent = filtered.length;
  showToast(`Showing ${filtered.length} products`, 'success');
}

function clearFilters() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = cb.id === 'chk-all' || cb.id === 'chk-in-stock'; });
  document.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = r.value === 'all' || r.value === '0'; });
  document.getElementById('price-range').value = 500;
  document.getElementById('price-max-label').textContent = '$500';
  document.getElementById('sort-select').value = 'featured';
  document.getElementById('search-input').value = '';
  renderProducts(PRODUCTS);
  document.getElementById('count-shown').textContent = PRODUCTS.length;
  showToast('Filters cleared', 'success');
}

function updatePriceLabel(val) { document.getElementById('price-max-label').textContent = `$${val}`; }
function updatePriceFilter() {}
function selectSwatch(el) { document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active')); el.classList.add('active'); }

function setTab(el, type) {
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  let filtered = PRODUCTS;
  if (type === 'new') filtered = PRODUCTS.filter(p => p.badge === 'new');
  else if (type === 'best') filtered = [...PRODUCTS].sort((a,b) => b.reviews-a.reviews).slice(0,8);
  else if (type === 'sale') filtered = PRODUCTS.filter(p => p.orig);
  else if (type === 'feat') filtered = PRODUCTS.filter(p => p.badge === 'hot' || p.rating >= 4.8);
  renderProducts(filtered);
  document.getElementById('count-shown').textContent = filtered.length;
}

function setView(mode, btn) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('product-grid').classList.toggle('list-view', mode === 'list');
}

function changePage(delta) { currentPage = Math.max(1, Math.min(8, currentPage+delta)); goPage(currentPage); }
function goPage(n) {
  currentPage = n;
  document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
  const t = document.getElementById(`btn-page-${n}`); if (t) t.classList.add('active');
  document.getElementById('btn-prev-page').disabled = n===1;
  document.getElementById('btn-next-page').disabled = n===8;
  showToast(`Page ${n}`, 'success');
}

function scrollToShop() { document.getElementById('shop-section').scrollIntoView({behavior:'smooth'}); }
