import type { Currency, Locale } from './types';

export interface AlternativeAnchor {
  currency: Currency;
  amount: number;
  he: string;
  en: string;
  emoji: string;
}

export const ALTERNATIVE_ANCHORS_ILS: AlternativeAnchor[] = [
  { currency: 'ILS', amount: 22, he: 'קפה', en: 'a coffee', emoji: '☕' },
  { currency: 'ILS', amount: 50, he: 'ספר בכריכה רכה', en: 'a paperback', emoji: '📕' },
  { currency: 'ILS', amount: 90, he: 'משלוח אוכל', en: 'a food delivery', emoji: '🥡' },
  { currency: 'ILS', amount: 200, he: 'כרטיס הופעה', en: 'a concert ticket', emoji: '🎟️' },
  { currency: 'ILS', amount: 500, he: 'ארוחת ערב זוגית', en: 'dinner for two', emoji: '🍷' },
  { currency: 'ILS', amount: 1200, he: 'יום ספא', en: 'a spa day', emoji: '💆' },
  { currency: 'ILS', amount: 3500, he: 'סוף שבוע באילת', en: 'a weekend in Eilat', emoji: '🏖️' },
];

export function pickAlternative(
  price: number,
  currency: Currency,
  locale: Locale
): { count: number; label: string; emoji: string } | null {
  if (currency !== 'ILS') return null;
  const candidates = [...ALTERNATIVE_ANCHORS_ILS].reverse().find((a) => price >= a.amount * 2);
  if (!candidates) return null;
  const count = Math.floor(price / candidates.amount);
  return {
    count,
    label: locale === 'he' ? candidates.he : candidates.en,
    emoji: candidates.emoji,
  };
}
