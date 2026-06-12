function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (products.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)"><div style="font-size:3rem;margin-bottom:1rem">🔍</div><p>No products found. Try adjusting your filters.</p></div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    const stockHtml = p.stock <= 5 ? `<p class="stock-indicator stock-low">⚠ Only ${p.stock} left!</p>` : p.stock <= 15 ? `<p class="stock-indicator stock-low">Low stock</p>` : `<p class="stock-indicator stock-ok">✓ In stock</p>`;
    return `<article class="product-card" id="product-card-${p.id}" data-testid="product-card-${p.id}" role="listitem" onclick="openModal(${p.id})">
      <div class="product-image" id="product-img-${p.id}">
        ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
        <div class="product-quick-actions" onclick="event.stopPropagation()">
          <button class="quick-action-btn" title="Add to wishlist" onclick="addToWishlist(${p.id})">♡</button>
          <button class="quick-action-btn" title="Quick view" onclick="openModal(${p.id})">👁</button>
          <button class="quick-action-btn" title="Compare" onclick="addToCompare(${p.id})">⚖</button>
        </div>
        <span style="pointer-events:none">${p.emoji}</span>
      </div>
      <div class="product-body">
        <p class="product-category">${p.cat}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${starsHtml(p.rating)}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price-current">$${p.price.toFixed(2)}</span>
          ${p.orig ? `<span class="price-original">$${p.orig.toFixed(2)}</span><span class="price-discount">${Math.round((1-p.price/p.orig)*100)}% OFF</span>` : ''}
        </div>
        ${stockHtml}
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="btn btn-cart btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>
          <button class="btn btn-wishlist btn-sm" onclick="addToWishlist(${p.id})">♡</button>
        </div>
      </div>
    </article>`;
  }).join('');
}
