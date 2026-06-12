function showPage(page) {
  document.getElementById('home-page').style.display = page === 'home' ? '' : 'none';
  const co = document.getElementById('checkout-page');
  co.classList.toggle('active', page === 'checkout');
  if (page === 'checkout') { renderCheckoutSummary(); goCheckoutStep(1); }
}

function setNavActive(el) {
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('size-btn') && !e.target.disabled) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearchModal(); closeModal(); closeCompareModal(); closeCart(); closeWishlist(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearchModal(); }
});

renderProducts(PRODUCTS);
updateCartUI();
updateWishlistUI();
showPage('home');
document.getElementById('count-total').textContent = PRODUCTS.length;
document.getElementById('count-shown').textContent = PRODUCTS.length;
