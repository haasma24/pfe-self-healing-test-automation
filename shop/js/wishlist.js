function addToWishlist(id) {
  if (!id) return;
  const p = PRODUCTS.find(x => x.id === id);
  if (wishlist.find(x => x.id === id)) { showToast(`Already in wishlist!`, 'success'); return; }
  wishlist.push({...p});
  updateWishlistUI();
  showToast(`${p.emoji} Added to wishlist ♡`, 'success');
}

function removeFromWishlist(id) { wishlist = wishlist.filter(x => x.id !== id); updateWishlistUI(); }

function updateWishlistUI() {
  const cnt = wishlist.length;
  const badge = document.getElementById('wishlist-count');
  badge.textContent = cnt; badge.style.display = cnt > 0 ? 'flex' : 'none';
  const list = document.getElementById('wishlist-items-list');
  if (!wishlist.length) {
    list.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;font-size:.875rem">Your wishlist is empty ♡</p>';
    return;
  }
  list.innerHTML = wishlist.map(item => `
    <div class="wishlist-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <button class="btn btn-cart btn-sm" style="margin-top:.4rem" onclick="addToCart(${item.id});removeFromWishlist(${item.id})">Move to Cart</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromWishlist(${item.id})">✕</button>
    </div>`).join('');
}

function openWishlist() { document.getElementById('cart-overlay').classList.add('open'); document.getElementById('wishlist-panel').classList.add('open'); }
function closeWishlist() { document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('wishlist-panel').classList.remove('open'); }
function moveAllWishlistToCart() { wishlist.forEach(item => addToCart(item.id)); wishlist = []; updateWishlistUI(); closeWishlist(); openCart(); }
