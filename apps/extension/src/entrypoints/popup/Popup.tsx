import { useEffect, useState } from 'react';
import {
  ARCHETYPES,
  ARCHETYPE_QUIZ,
  type Archetype,
  type Locale,
} from '@rethink/shared';
import heStrings from '@rethink/shared/i18n/he';
import enStrings from '@rethink/shared/i18n/en';
import {
  getSettings,
  setSettings as persistSettings,
  getStats,
  type ExtSettings,
} from '../../lib/storage';

export function Popup() {
  const [settings, setSettings] = useState<ExtSettings | null>(null);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  if (!settings) return null;
  const t = settings.locale === 'he' ? heStrings : enStrings;

  if (!settings.onboarded) {
    return (
      <Onboarding
        initial={settings}
        strings={t}
        onDone={async (next) => {
          const saved = await persistSettings({ ...next, onboarded: true });
          setSettings(saved);
        }}
      />
    );
  }
  return <Dashboard settings={settings} setSettings={setSettings} strings={t} />;
}

function Onboarding(props: {
  initial: ExtSettings;
  strings: typeof heStrings;
  onDone: (s: ExtSettings) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState<Locale>(props.initial.locale);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number | undefined>(props.initial.monthlyBudget);
  const t = locale === 'he' ? heStrings : enStrings;
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  function selectArchetypeFromQuiz(value: string) {
    setArchetype(value as Archetype);
    setStep(2);
  }

  return (
    <div dir={dir}>
      <div className="pp-brand">RETHINK</div>

      {step === 0 && (
        <>
          <div className="pp-h1">{t.onboarding.welcome}</div>
          <div className="pp-sub">{t.onboarding.tagline}</div>
          <div className="pp-section">
            <div className="pp-section-title">{t.onboarding.language}</div>
            <div className="pp-lang-row">
              <button
                className={`pp-lang-btn ${locale === 'he' ? 'active' : ''}`}
                onClick={() => setLocale('he')}
              >עברית</button>
              <button
                className={`pp-lang-btn ${locale === 'en' ? 'active' : ''}`}
                onClick={() => setLocale('en')}
              >English</button>
            </div>
          </div>
          <div className="pp-row">
            <button className="pp-btn pp-btn-primary" onClick={() => setStep(1)}>
              {t.onboarding.start}
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="pp-h1">{t.onboarding.archetypeIntro}</div>
          <div className="pp-section">
            {ARCHETYPE_QUIZ[0].options.map((opt) => (
              <button
                key={opt.value}
                className="pp-option"
                onClick={() => selectArchetypeFromQuiz(opt.value)}
              >
                <div className="pp-option-label">{opt[locale]}</div>
              </button>
            ))}
          </div>
          <div className="pp-row">
            <button className="pp-btn pp-btn-ghost" onClick={() => setStep(0)}>
              {t.onboarding.back}
            </button>
          </div>
        </>
      )}

      {step === 2 && archetype && (
        <>
          <div className="pp-h1">{t.onboarding.monthlyBudget}</div>
          <div className="pp-sub">{t.onboarding.monthlyBudgetHint}</div>
          <div className="pp-section">
            <input
              type="number"
              className="pp-input"
              placeholder="2000"
              value={monthlyBudget ?? ''}
              onChange={(e) => setMonthlyBudget(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="pp-section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{ARCHETYPES[archetype].emoji}</span>
            <div>
              <div style={{ fontWeight: 700, color: ARCHETYPES[archetype].color }}>
                {ARCHETYPES[archetype].label[locale]}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {locale === 'he' ? 'הארכיטיפ שזיהינו' : 'Your detected archetype'}
              </div>
            </div>
          </div>
          <div className="pp-row">
            <button className="pp-btn pp-btn-ghost" onClick={() => setStep(1)}>
              {t.onboarding.back}
            </button>
            <button
              className="pp-btn pp-btn-primary"
              onClick={() =>
                void props.onDone({
                  ...props.initial,
                  locale,
                  archetype,
                  monthlyBudget,
                  onboarded: true,
                  enabled: true,
                })
              }
            >
              {t.onboarding.finish}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Dashboard(props: {
  settings: ExtSettings;
  setSettings: (s: ExtSettings) => void;
  strings: typeof heStrings;
}) {
  const { settings, setSettings, strings } = props;
  const [stats, setStats] = useState({ saved: 0, cancelled: 0, total: 0, totalSavedAmount: 0 });
  const dir = settings.locale === 'he' ? 'rtl' : 'ltr';
  const archDef = ARCHETYPES[settings.archetype];

  useEffect(() => {
    void getStats().then(setStats);
  }, []);

  async function toggleEnabled() {
    const next = await persistSettings({ enabled: !settings.enabled });
    setSettings(next);
  }

  const formattedSavings = new Intl.NumberFormat(
    settings.locale === 'he' ? 'he-IL' : 'en-US',
    { style: 'currency', currency: settings.currency, maximumFractionDigits: 0 }
  ).format(stats.totalSavedAmount);

  return (
    <div dir={dir}>
      <div className="pp-brand">RETHINK</div>

      <div className="pp-savings">
        <div className="pp-savings-num">{formattedSavings}</div>
        <div className="pp-savings-label">
          {settings.locale === 'he' ? 'לא הוצא באימפולס · 30 ימים' : 'not spent impulsively · last 30d'}
        </div>
      </div>

      <div className="pp-stats">
        <div className="pp-stat">
          <div className="pp-stat-num" style={{ color: archDef.color }}>{stats.saved}</div>
          <div className="pp-stat-label">{strings.popup.saved}</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-num" style={{ color: '#22c55e' }}>{stats.cancelled}</div>
          <div className="pp-stat-label">{strings.popup.cancelled}</div>
        </div>
      </div>

      <div className="pp-section">
        <div className="pp-section-title">
          {settings.locale === 'he' ? 'ארכיטיפ' : 'Archetype'}
        </div>
        <div className="pp-option selected">
          <div className="pp-option-label" style={{ color: archDef.color }}>
            {archDef.emoji} {archDef.label[settings.locale]}
          </div>
        </div>
      </div>

      <div className="pp-section">
        <div className="pp-toggle">
          <div className="pp-toggle-label">
            {settings.locale === 'he' ? 'הגנה פעילה' : 'Protection active'}
          </div>
          <div
            className={`pp-switch ${settings.enabled ? 'on' : ''}`}
            onClick={toggleEnabled}
            role="switch"
            aria-checked={settings.enabled}
          />
        </div>
      </div>
    </div>
  );
}
