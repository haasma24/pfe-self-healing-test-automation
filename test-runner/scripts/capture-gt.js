// scripts/capture-gt.js
import { captureGroundTruth } from '../helpers/ground-truth.js';
import { PAGE_URL } from '../helpers/config.js';

captureGroundTruth(
  PAGE_URL,
  [
    '[data-testid="promo-banner"]',
    '[data-testid="navigation"]',
    '[data-testid="site-logo"]',
    '[data-testid="nav-home"]',
    '[data-testid="search-trigger"]',
    '[data-testid="wishlist-nav-btn"]',
    '[data-testid="cart-item-count"]',
    '[data-testid="product-card-1"]',
    '[data-testid="filter-sidebar"]',
    '#count-shown',
    '#count-total',
    '#promo-countdown',
  ],
  './eval/scenarios/arcane-shop.json'
);
