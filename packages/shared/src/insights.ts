import type { Archetype, PurchaseContext, Locale } from './types';

export interface Insight {
  label: string;
  body: string;
}

interface Ctx {
  context: PurchaseContext;
  archetype: Archetype;
  locale: Locale;
  monthlyBudget?: number;
  monthlySpent?: number;
  decisionsThisMonth?: number;
  hourOfDay?: number;
}

function fmt(price: number, currency: PurchaseContext['currency'], locale: Locale): string {
  const lang = locale === 'he' ? 'he-IL' : 'en-US';
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

function projected6Months(price: number): number {
  return Math.round(price * 6);
}

export function generateInsight(ctx: Ctx): Insight {
  const { context, archetype, locale, monthlyBudget, monthlySpent, hourOfDay } = ctx;
  const priceText = fmt(context.price, context.currency, locale);
  const isHe = locale === 'he';

  if (archetype === 'impulsive') {
    const projected = fmt(projected6Months(context.price), context.currency, locale);
    return {
      label: isHe ? 'גשר לעצמך-העתידי' : 'Future-self bridge',
      body: isHe
        ? `בעוד 6 חודשים, אותך-העתידי ${projected} בחיסכון, או פריט אחר שהוא באמת רצה.`
        : `In 6 months, Future-You has ${projected} saved, or another item you actually wanted.`,
    };
  }

  if (archetype === 'emotional') {
    const hour = hourOfDay ?? new Date().getHours();
    const isLateNight = hour >= 22 || hour < 6;
    return {
      label: isHe ? 'זיהוי טריגר' : 'Trigger nudge',
      body: isLateNight
        ? isHe
          ? `קנייה מאוחרת בלילה לרוב אחרי יום קשה. ${priceText} זה הרבה לרגש רגעי. תרצה לישון על זה?`
          : `Late-night purchases usually follow a tough day. ${priceText} is a lot for a momentary feeling. Sleep on it?`
        : isHe
          ? `מה אתה מרגיש עכשיו? אם זה סטרס או שעמום, הקנייה לא תרגיע באמת. ${priceText} שווים את זה?`
          : `What are you feeling right now? If it's stress or boredom, this won't actually help. Is ${priceText} worth it?`,
    };
  }

  if (archetype === 'cumulative') {
    if (monthlyBudget && monthlySpent !== undefined) {
      const pct = Math.round((monthlySpent / monthlyBudget) * 100);
      const after = monthlySpent + context.price;
      const afterPct = Math.round((after / monthlyBudget) * 100);
      return {
        label: isHe ? 'מסגור הפסד' : 'Loss frame',
        body: isHe
          ? `השתמשת ב-${pct}% מהתקציב החודשי. הרכישה הזו תעלה אותך ל-${afterPct}%, מצטבר.`
          : `You've used ${pct}% of your monthly budget. This will push you to ${afterPct}%, cumulative.`,
      };
    }
    return {
      label: isHe ? 'מסגור הפסד' : 'Loss frame',
      body: isHe
        ? `קניות קטנות מצטברות מהר. השאלה היא לא ${priceText}, אלא כמה כאלה החודש.`
        : `Small purchases add up fast. The question isn't ${priceText}, it's how many like it this month.`,
    };
  }

  return {
    label: isHe ? 'מיושר' : 'Aligned',
    body: isHe
      ? `אתה במסלול. ${priceText} בתוך התקציב, אין צורך לעצור.`
      : `On track. ${priceText} is within budget, no need to pause.`,
  };
}

export function alternativeFraming(price: number, locale: Locale): string {
  const isHe = locale === 'he';
  const anchors = [
    { amount: 22, he: 'קפה', en: 'coffee', emoji: '☕' },
    { amount: 50, he: 'ספר', en: 'book', emoji: '📕' },
    { amount: 90, he: 'משלוח אוכל', en: 'food delivery', emoji: '🥡' },
    { amount: 200, he: 'כרטיס הופעה', en: 'concert ticket', emoji: '🎟️' },
    { amount: 500, he: 'ארוחה זוגית', en: 'dinner for two', emoji: '🍷' },
  ];
  const best = [...anchors].reverse().find((a) => price >= a.amount) ?? anchors[0];
  const count = Math.floor(price / best.amount);
  if (count < 2) return '';
  const noun = isHe ? best.he : best.en;
  return isHe ? `${best.emoji} = ${count} ${noun}` : `${best.emoji} ${count} × ${noun}`;
}
