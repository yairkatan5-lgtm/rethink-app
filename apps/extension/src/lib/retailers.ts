export interface RetailerConfig {
  id: string;
  name: string;
  matchHost: RegExp;
  triggerSelectors: string[];
  itemTitle?: string;
  itemPrice?: string;
  itemImage?: string;
  currency?: 'ILS' | 'USD' | 'EUR';
}

export const RETAILERS: RetailerConfig[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    matchHost: /(^|\.)amazon\.(com|co\.[a-z]+|de|fr|es|it|nl|ae|sa|in)$/i,
    triggerSelectors: [
      '#buy-now-button',
      'input#buy-now-button',
      '#one-click-button',
      '#submitOrderButtonId',
      'input[name="placeYourOrder1"]',
      'button[name="placeYourOrder1"]',
    ],
    itemTitle: '#productTitle, #title',
    itemPrice: '#corePrice_feature_div .a-price .a-offscreen, .priceToPay .a-offscreen, #price_inside_buybox',
    itemImage: '#imgTagWrapperId img, #landingImage',
    currency: 'USD',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    matchHost: /(^|\.)aliexpress\.(com|us|ru|fr|es|it|nl|co\.il)$/i,
    triggerSelectors: [
      'button[data-pl="product-buy-now"]',
      'button.buynow',
      'div.buynow--buy--3rAvowB',
      'button[class*="buynow"]',
      'button[class*="BuyNow"]',
    ],
    itemTitle: 'h1[data-pl="product-title"], h1.product-title-text, h1',
    itemPrice: '.product-price-value, [class*="product-price-current"]',
    itemImage: 'img.magnifier--image--EYYoSlr, .image-view-magnifier-block img, img[class*="magnifier"]',
  },
  {
    id: 'shein',
    name: 'Shein',
    matchHost: /(^|\.)shein\.(com|co\.il|us)$/i,
    triggerSelectors: [
      'div.goods-btn__add-btn',
      'button.he-btn--primary',
      '.add-bag-btn',
      'button.add-to-cart-btn',
      'button[class*="addToCart"]',
      'button[class*="checkout"]',
    ],
    itemTitle: 'h1.product-intro__head-name, .product-intro__head h1',
    itemPrice: '.product-intro__head-price .original, .product-intro__head-price',
    itemImage: '.product-intro__main img, .product-intro__head-mainimg img',
  },
  {
    id: 'ksp',
    name: 'KSP',
    matchHost: /(^|\.)ksp\.co\.il$/i,
    triggerSelectors: [
      'button.add-to-basket-btn',
      'button.btn-buy',
      'button[onclick*="addToBasket"]',
      'a[href*="checkout"]',
      'button.btn-checkout',
    ],
    itemTitle: 'h1.product-name, h1[itemprop="name"], h1',
    itemPrice: '.price, [itemprop="price"], .item-price',
    itemImage: '.product-image img, [itemprop="image"]',
    currency: 'ILS',
  },
  {
    id: 'terminalx',
    name: 'Terminal X',
    matchHost: /(^|\.)terminalx\.com$/i,
    triggerSelectors: [
      'button[data-testid="add-to-cart-button"]',
      'button[data-testid*="checkout"]',
      'button.add-to-cart',
      'button[class*="AddToCart"]',
      'button[class*="Checkout"]',
    ],
    itemTitle: 'h1[data-testid="product-name"], h1',
    itemPrice: '[data-testid*="price"], .price',
    itemImage: '[data-testid="product-image"] img, .product-image img',
    currency: 'ILS',
  },
];

export function detectRetailer(host = location.hostname): RetailerConfig | null {
  return RETAILERS.find((r) => r.matchHost.test(host)) ?? null;
}

const GENERIC_BUY_TEXT = /\b(buy now|place order|pay now|complete order|proceed to checkout|checkout)\b|לקנייה|לתשלום|לרכישה|בצע הזמנה|המשך לתשלום|לקופה|הזמנה|לרכוש|לסיום הקנייה/i;

export function isGenericBuyButton(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag !== 'button' && tag !== 'a' && !(tag === 'input' && (el as HTMLInputElement).type === 'submit')) {
    if (!el.matches('[role="button"]')) return false;
  }
  const text = (el.textContent ?? '').trim().slice(0, 80);
  if (!text) {
    const aria = el.getAttribute('aria-label') ?? '';
    const value = (el as HTMLInputElement).value ?? '';
    return GENERIC_BUY_TEXT.test(aria) || GENERIC_BUY_TEXT.test(value);
  }
  return GENERIC_BUY_TEXT.test(text);
}

export function extractItem(
  retailer: RetailerConfig | null,
  fallbackTitle?: string
): { title: string; price: number; currency: 'ILS' | 'USD' | 'EUR'; imageUrl?: string } {
  if (retailer) {
    const titleEl = retailer.itemTitle ? document.querySelector(retailer.itemTitle) : null;
    const priceEl = retailer.itemPrice ? document.querySelector(retailer.itemPrice) : null;
    const imgEl = retailer.itemImage ? (document.querySelector(retailer.itemImage) as HTMLImageElement | null) : null;
    const title = titleEl?.textContent?.trim() || fallbackTitle || document.title;
    const priceText = priceEl?.textContent ?? '';
    const price = parsePrice(priceText);
    const currency = retailer.currency ?? detectCurrencyFromText(priceText) ?? 'ILS';
    return { title, price, currency, imageUrl: imgEl?.src };
  }
  const pageText = document.body?.innerText?.slice(0, 4000) ?? '';
  return {
    title: document.title,
    price: parsePrice(pageText),
    currency: detectCurrencyFromText(pageText) ?? 'ILS',
  };
}

function parsePrice(text: string): number {
  if (!text) return 0;
  const match = text.match(/[\d,]+(?:\.\d{1,2})?/);
  if (!match) return 0;
  const cleaned = match[0].replace(/,/g, '');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function detectCurrencyFromText(text: string): 'ILS' | 'USD' | 'EUR' | null {
  if (/₪|שח|ש"ח|ש״ח|ILS/i.test(text)) return 'ILS';
  if (/\$|USD/.test(text)) return 'USD';
  if (/€|EUR/.test(text)) return 'EUR';
  return null;
}
