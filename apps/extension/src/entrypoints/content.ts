import { defineContentScript } from 'wxt/utils/define-content-script';
import { detectRetailer, isGenericBuyButton, extractItem } from '../lib/retailers';
import { addWishlistItem, getSettings, logDecision } from '../lib/storage';
import { delaySecondsFor, generateInsight, type Outcome, type PurchaseContext } from '@rethink/shared';
import { mountFrictionOverlay } from '../lib/mount';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    const settings = await getSettings();
    if (!settings.enabled || !settings.onboarded) return;

    const retailer = detectRetailer();
    let active = false;
    let bypassNextClick = false;

    const handleClick = async (ev: Event) => {
      if (bypassNextClick) {
        bypassNextClick = false;
        return;
      }
      if (active) return;
      const target = ev.target as Element | null;
      if (!target) return;

      const trigger = matchTrigger(target);
      if (!trigger) return;

      ev.preventDefault();
      ev.stopImmediatePropagation();
      active = true;

      const item = extractItem(retailer, trigger.textContent?.trim());
      if (item.price <= 0) {
        active = false;
        return;
      }

      const context: PurchaseContext = {
        title: item.title.slice(0, 140),
        price: item.price,
        currency: item.currency,
        retailer: retailer?.name ?? location.hostname,
        sourceUrl: location.href,
        imageUrl: item.imageUrl,
      };

      const delay = delaySecondsFor(settings.archetype, context.price);
      const insight = generateInsight({
        context,
        archetype: settings.archetype,
        locale: settings.locale,
        monthlyBudget: settings.monthlyBudget,
      });

      const outcome: Outcome = await new Promise((resolve) => {
        mountFrictionOverlay({
          context,
          archetype: settings.archetype,
          locale: settings.locale,
          monthlyBudget: settings.monthlyBudget,
          insight,
          delaySeconds: delay,
          onDecision: (out) => resolve(out),
          onClose: () => resolve('cancelled'),
        });
      });

      await logDecision({ context, archetype: settings.archetype, delaySeconds: delay, outcome });
      if (outcome === 'saved') await addWishlistItem(context);

      active = false;

      if (outcome === 'bought') {
        bypassNextClick = true;
        triggerOriginalAction(trigger);
      }
    };

    document.addEventListener('click', handleClick, { capture: true });

    function matchTrigger(target: Element): Element | null {
      if (retailer) {
        for (const sel of retailer.triggerSelectors) {
          const match = target.closest(sel);
          if (match) return match;
        }
      }
      const button = target.closest('button, a, [role="button"], input[type="submit"]');
      if (button && isGenericBuyButton(button)) return button;
      return null;
    }
  },
});

function triggerOriginalAction(el: Element) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'a') {
    const href = (el as HTMLAnchorElement).href;
    if (href) {
      window.location.href = href;
      return;
    }
  }
  const synthetic = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
  el.dispatchEvent(synthetic);
}
