export type Archetype = 'impulsive' | 'emotional' | 'cumulative' | 'aligned';

export type Locale = 'he' | 'en';

export type Currency = 'ILS' | 'USD' | 'EUR';

export type Outcome = 'bought' | 'saved' | 'cancelled';

export interface PurchaseContext {
  title: string;
  price: number;
  currency: Currency;
  retailer: string;
  sourceUrl: string;
  imageUrl?: string;
  category?: string;
}

export interface UserProfile {
  archetype: Archetype;
  language: Locale;
  currency: Currency;
  monthlyBudget?: number;
  mascotName?: string;
}

export interface WishlistItem extends PurchaseContext {
  id: string;
  savedAt: number;
  reevaluateAt: number;
  decision: 'pending' | Outcome;
}

export interface DecisionLog {
  id: string;
  context: PurchaseContext;
  archetype: Archetype;
  interventionShownAt: number;
  delaySeconds: number;
  outcome: Outcome;
  xpAwarded: number;
}

export interface MascotState {
  stage: 0 | 1 | 2 | 3;
  xp: number;
  lastEvolvedAt: number;
}
