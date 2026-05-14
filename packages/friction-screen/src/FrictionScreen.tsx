import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ARCHETYPES,
  colors,
  delaySecondsFor,
  generateInsight,
  pickAlternative,
  type Archetype,
  type Locale,
  type Outcome,
  type PurchaseContext,
} from '@rethink/shared';
import { frictionStylesheet } from './styles';

export interface FrictionScreenProps {
  context: PurchaseContext;
  archetype: Archetype;
  locale: Locale;
  monthlyBudget?: number;
  monthlySpent?: number;
  insight?: { label: string; body: string };
  onDecision: (outcome: Outcome) => void;
  onClose?: () => void;
  delaySeconds?: number;
  strings: {
    brand: string;
    title: string;
    sub: string;
    buyAfterPause: string;
    buyNow: string;
    save: string;
    cancel: string;
    secondsRemaining: string;
    alternativeChip: string;
    saveOk: string;
    saveSub: string;
    savedAmount: string;
    savedBadge: string;
  };
}

const R = 36;
const CIRC = 2 * Math.PI * R;

export function FrictionScreen(props: FrictionScreenProps) {
  const { context, archetype, locale, insight, onDecision, onClose, strings } = props;
  const archDef = ARCHETYPES[archetype];
  const delay = props.delaySeconds ?? delaySecondsFor(archetype, context.price);
  const isHe = locale === 'he';

  const [remaining, setRemaining] = useState(delay);
  const [confirmed, setConfirmed] = useState<Outcome | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (delay <= 0) {
      setRemaining(0);
      return;
    }
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      const next = Math.max(0, delay - elapsed);
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [delay]);

  const computedInsight = useMemo(
    () =>
      insight ??
      generateInsight({
        context,
        archetype,
        locale,
        monthlyBudget: props.monthlyBudget,
        monthlySpent: props.monthlySpent,
      }),
    [insight, context, archetype, locale, props.monthlyBudget, props.monthlySpent]
  );

  const alt = useMemo(
    () => pickAlternative(context.price, context.currency, locale),
    [context.price, context.currency, locale]
  );

  const priceFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
        style: 'currency',
        currency: context.currency,
        maximumFractionDigits: 0,
      }).format(context.price);
    } catch {
      return `${context.currency} ${context.price}`;
    }
  }, [context.price, context.currency, locale]);

  const progress = delay > 0 ? remaining / delay : 0;
  const archetypeColor = archDef.color;
  const buyDisabled = remaining > 0;

  function decide(outcome: Outcome) {
    if (outcome === 'saved') {
      setConfirmed('saved');
      setTimeout(() => onDecision('saved'), 1800);
      return;
    }
    onDecision(outcome);
  }

  return (
    <div className="rt-backdrop" role="dialog" aria-modal="true" dir={isHe ? 'rtl' : 'ltr'}>
      <style>{frictionStylesheet}</style>
      <div className="rt-card">
        {onClose && (
          <button className="rt-close" onClick={onClose} aria-label="Close">✕</button>
        )}

        <div className="rt-brand">{strings.brand}</div>
        <span
          className="rt-archetype"
          style={{
            background: `${archetypeColor}1f`,
            color: archetypeColor,
            border: `1px solid ${archetypeColor}40`,
          }}
        >
          {archDef.label[locale]}
        </span>

        <div className="rt-title">{strings.title}</div>
        <div className="rt-sub">{strings.sub}</div>

        <div className="rt-item">
          <div className="rt-item-img">
            {context.imageUrl ? (
              <img src={context.imageUrl} alt="" />
            ) : (
              <span>{archDef.emoji}</span>
            )}
          </div>
          <div className="rt-item-info">
            <div className="rt-item-title" title={context.title}>{context.title}</div>
            <div className="rt-item-meta">{context.retailer}</div>
          </div>
          <div className="rt-item-price" style={{ color: archetypeColor }}>{priceFormatted}</div>
        </div>

        {delay > 0 && (
          <>
            <div className="rt-countdown-wrap">
              <svg className="rt-countdown-svg" viewBox="0 0 90 90">
                <circle className="rt-countdown-track" cx="45" cy="45" r={R} />
                <circle
                  className="rt-countdown-prog"
                  cx="45"
                  cy="45"
                  r={R}
                  style={{
                    stroke: archetypeColor,
                    strokeDasharray: CIRC,
                    strokeDashoffset: CIRC * (1 - progress),
                  }}
                />
              </svg>
              <div className="rt-countdown-num">
                {remaining >= 60 ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : remaining}
              </div>
            </div>
            <div className="rt-countdown-label">{strings.secondsRemaining}</div>
          </>
        )}

        <div
          className="rt-ai-card"
          style={{
            background: `${archetypeColor}14`,
            border: `1px solid ${archetypeColor}40`,
          }}
        >
          <div className="rt-ai-label" style={{ color: archetypeColor }}>
            {archDef.insightLabel[locale]}
          </div>
          <div className="rt-ai-body">{computedInsight.body}</div>
        </div>

        {alt && alt.count >= 2 && (
          <div className="rt-alt">
            <span>{alt.emoji}</span>
            <span>{strings.alternativeChip} {alt.count} × {alt.label}</span>
          </div>
        )}

        <div className="rt-btns">
          <button
            className="rt-btn rt-btn-primary"
            style={{ background: buyDisabled ? colors.gray3 : archetypeColor }}
            disabled={buyDisabled}
            onClick={() => decide('bought')}
          >
            {buyDisabled ? `${strings.buyAfterPause} (${remaining}s)` : strings.buyNow}
          </button>
          <button className="rt-btn rt-btn-save" onClick={() => decide('saved')}>
            {strings.save}
          </button>
          <button className="rt-btn rt-btn-cancel" onClick={() => decide('cancelled')}>
            {strings.cancel}
          </button>
        </div>

        {confirmed === 'saved' && (
          <div className="rt-confirm-overlay">
            <div className="rt-confirm-icon">🎉</div>
            <div className="rt-confirm-title">{strings.saveOk}</div>
            <div className="rt-confirm-sub">{strings.saveSub}</div>
            <div className="rt-confirm-amount">{priceFormatted}</div>
            <div className="rt-confirm-label">{strings.savedAmount}</div>
            <div className="rt-confirm-badge">{strings.savedBadge} ✓</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FrictionScreen;
