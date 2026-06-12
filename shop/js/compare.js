function addToCompare(id) {
  if (!id) return;
  const p = PRODUCTS.find(x => x.id === id);
  if (compareList.find(x => x.id === id)) { showToast('Already in compare list', 'error'); return; }
  if (compareList.length >= 3) { showToast('Max 3 items to compare', 'error'); return; }
  compareList.push({...p});
  updateCompareUI();
  showToast(`${p.emoji} Added to compare list`, 'success');
}

function updateCompareUI() {
  const bar = document.getElementById('compare-bar');
  bar.classList.toggle('active', compareList.length > 0);
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById(`cslot-${i}`);
    if (compareList[i]) {
      slot.className = 'compare-slot filled';
      slot.innerHTML = `${compareList[i].emoji}<span style="font-size:.6rem;color:var(--muted)">${compareList[i].name.split(' ').slice(0,2).join(' ')}</span><button class="slot-remove" onclick="removeFromCompare(${compareList[i].id})">✕</button>`;
    } else {
      slot.className = 'compare-slot';
      slot.innerHTML = 'Add item';
    }
  }
}

function removeFromCompare(id) { compareList = compareList.filter(x => x.id !== id); updateCompareUI(); }
function clearCompare() { compareList = []; updateCompareUI(); }

function openCompareModal() {
  if (!compareList.length) { showToast('Add products to compare first', 'error'); return; }
  const wrap = document.getElementById('compare-table-wrap');
  const allSpecs = [...new Set(compareList.flatMap(p => Object.keys(p.specs || {})))];
  wrap.innerHTML = `<table class="compare-table">
    <thead><tr>
      <th class="feature-label">Feature</th>
      ${compareList.map(p => `<th>${p.emoji}<br><span style="font-size:.8rem">${p.name}</span><br><span style="color:var(--accent);font-family:'DM Mono',monospace">$${p.price.toFixed(2)}</span></th>`).join('')}
    </tr></thead>
    <tbody>
      <tr><td class="feature-label">Category</td>${compareList.map(p=>`<td>${p.cat}</td>`).join('')}</tr>
      <tr><td class="feature-label">Rating</td>${compareList.map(p=>`<td>${starsHtml(p.rating)} (${p.reviews})</td>`).join('')}</tr>
      <tr><td class="feature-label">In Stock</td>${compareList.map(p=>`<td style="color:var(--success)">✓ ${p.stock} units</td>`).join('')}</tr>
      ${allSpecs.map(s => `<tr><td class="feature-label">${s}</td>${compareList.map(p=>`<td>${p.specs?.[s] ?? '—'}</td>`).join('')}</tr>`).join('')}
      <tr><td class="feature-label">Action</td>${compareList.map(p=>`<td><button class="btn btn-cart btn-sm" onclick="addToCart(${p.id});closeCompareModal()">Add to Cart</button></td>`).join('')}</tr>
    </tbody>
  </table>`;
  document.getElementById('compare-modal').classList.add('open');
}

function closeCompareModal() { document.getElementById('compare-modal').classList.remove('open'); }
