import type { Archetype } from './types';
import { colors } from './tokens';

export interface ArchetypeDef {
  id: Archetype;
  label: { he: string; en: string };
  color: string;
  emoji: string;
  defaultDelaySeconds: number;
  insightLabel: { he: string; en: string };
}

export const ARCHETYPES: Record<Archetype, ArchetypeDef> = {
  impulsive: {
    id: 'impulsive',
    label: { he: 'אימפולסיבי', en: 'IMPULSIVE' },
    color: colors.blue,
    emoji: '🛍️',
    defaultDelaySeconds: 30,
    insightLabel: { he: '🤖 גשר לעצמך-העתידי', en: '🤖 FUTURE-SELF BRIDGE' },
  },
  emotional: {
    id: 'emotional',
    label: { he: 'רגשי', en: 'EMOTIONAL' },
    color: colors.amber,
    emoji: '🍕',
    defaultDelaySeconds: 180,
    insightLabel: { he: '🤖 זיהוי טריגר', en: '🤖 TRIGGER NUDGE' },
  },
  cumulative: {
    id: 'cumulative',
    label: { he: 'מצטבר', en: 'CUMULATIVE' },
    color: colors.purple,
    emoji: '📦',
    defaultDelaySeconds: 86400,
    insightLabel: { he: '🤖 מסגור הפסד', en: '🤖 LOSS FRAME' },
  },
  aligned: {
    id: 'aligned',
    label: { he: 'מיושר', en: 'ALIGNED' },
    color: colors.green,
    emoji: '☕',
    defaultDelaySeconds: 0,
    insightLabel: { he: '✅ מיושר', en: '✅ ALIGNED' },
  },
};

export function delaySecondsFor(archetype: Archetype, price: number): number {
  const def = ARCHETYPES[archetype];
  if (archetype === 'aligned') return 0;
  if (price >= 1000 && archetype !== 'emotional') return Math.max(def.defaultDelaySeconds, 300);
  return def.defaultDelaySeconds;
}

export const ARCHETYPE_QUIZ = [
  {
    id: 'context',
    he: 'מתי הכי נפוץ אצלך לקנות באימפולס?',
    en: 'When do you most often buy on impulse?',
    options: [
      { value: 'impulsive', he: 'גלילה אקראית, פתאום משהו תופס', en: 'Random scrolling, something catches my eye' },
      { value: 'emotional', he: 'אחרי יום קשה, סטרס, בלילה', en: 'After a hard day, stress, late at night' },
      { value: 'cumulative', he: 'הרבה רכישות קטנות שמצטברות', en: 'Lots of small purchases that add up' },
      { value: 'aligned', he: 'נדיר, אני בדרך כלל מתוכנן/ת', en: 'Rarely, I usually plan' },
    ],
  },
  {
    id: 'trigger',
    he: 'מה הכי גורם לך ללחוץ "קנה עכשיו"?',
    en: 'What most often pushes you to click "Buy Now"?',
    options: [
      { value: 'impulsive', he: 'התרגשות מהפריט עצמו', en: 'Excitement about the item itself' },
      { value: 'emotional', he: 'רצון להרגיש טוב יותר', en: 'A wish to feel better' },
      { value: 'cumulative', he: 'משלוח חינם / מבצע על כמה פריטים', en: 'Free shipping / multi-item deal' },
      { value: 'aligned', he: 'צורך מתוכנן מראש', en: 'A pre-planned need' },
    ],
  },
] as const;
