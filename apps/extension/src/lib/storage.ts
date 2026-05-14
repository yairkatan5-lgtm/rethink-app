import type {
  Archetype,
  Currency,
  DecisionLog,
  Locale,
  Outcome,
  PurchaseContext,
  WishlistItem,
} from '@rethink/shared';

export interface ExtSettings {
  archetype: Archetype;
  locale: Locale;
  currency: Currency;
  monthlyBudget?: number;
  enabled: boolean;
  onboarded: boolean;
}

const DEFAULTS: ExtSettings = {
  archetype: 'impulsive',
  locale: 'he',
  currency: 'ILS',
  enabled: true,
  onboarded: false,
};

const KEYS = {
  settings: 'rethink.settings',
  wishlist: 'rethink.wishlist',
  decisions: 'rethink.decisions',
} as const;

const storage = chrome.storage.local;

export async function getSettings(): Promise<ExtSettings> {
  const out = await storage.get(KEYS.settings);
  return { ...DEFAULTS, ...(out[KEYS.settings] as Partial<ExtSettings> | undefined) };
}

export async function setSettings(patch: Partial<ExtSettings>): Promise<ExtSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await storage.set({ [KEYS.settings]: next });
  return next;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const out = await storage.get(KEYS.wishlist);
  return (out[KEYS.wishlist] as WishlistItem[] | undefined) ?? [];
}

export async function addWishlistItem(context: PurchaseContext): Promise<WishlistItem> {
  const now = Date.now();
  const item: WishlistItem = {
    ...context,
    id: crypto.randomUUID(),
    savedAt: now,
    reevaluateAt: now + 24 * 60 * 60 * 1000,
    decision: 'pending',
  };
  const list = await getWishlist();
  await storage.set({ [KEYS.wishlist]: [item, ...list].slice(0, 200) });
  return item;
}

export async function getDecisions(): Promise<DecisionLog[]> {
  const out = await storage.get(KEYS.decisions);
  return (out[KEYS.decisions] as DecisionLog[] | undefined) ?? [];
}

export async function logDecision(args: {
  context: PurchaseContext;
  archetype: Archetype;
  delaySeconds: number;
  outcome: Outcome;
}): Promise<DecisionLog> {
  const log: DecisionLog = {
    id: crypto.randomUUID(),
    context: args.context,
    archetype: args.archetype,
    interventionShownAt: Date.now(),
    delaySeconds: args.delaySeconds,
    outcome: args.outcome,
    xpAwarded: xpFor(args.outcome, args.context.price),
  };
  const list = await getDecisions();
  await storage.set({ [KEYS.decisions]: [log, ...list].slice(0, 500) });
  return log;
}

function xpFor(outcome: Outcome, price: number): number {
  if (outcome === 'cancelled') return 50 + Math.min(50, Math.round(price / 50));
  if (outcome === 'saved') return 30 + Math.min(30, Math.round(price / 100));
  return 0;
}

export async function getStats() {
  const decisions = await getDecisions();
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = decisions.filter((d) => d.interventionShownAt >= monthAgo);
  const saved = recent.filter((d) => d.outcome === 'saved').length;
  const cancelled = recent.filter((d) => d.outcome === 'cancelled').length;
  const totalSavedAmount = recent
    .filter((d) => d.outcome !== 'bought')
    .reduce((sum, d) => sum + d.context.price, 0);
  return { saved, cancelled, total: recent.length, totalSavedAmount };
}
