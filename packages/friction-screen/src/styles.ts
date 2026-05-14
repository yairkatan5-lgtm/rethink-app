import { colors, font } from '@rethink/shared';

export const frictionStylesheet = `
:host {
  all: initial;
  font-family: ${font.family};
  color: ${colors.white};
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.rt-backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(79,142,247,0.15), rgba(7,9,26,0.96) 60%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
  animation: rt-fadein .25s ease-out;
}
@keyframes rt-fadein { from { opacity: 0 } to { opacity: 1 } }

.rt-card {
  background: ${colors.navy2};
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 22px;
  width: min(440px, 92vw);
  padding: 32px 28px;
  text-align: center;
  box-shadow: 0 48px 120px rgba(0,0,0,.65);
  position: relative;
  animation: rt-pop .35s cubic-bezier(.2,.9,.3,1.2);
}
@keyframes rt-pop { from { opacity: 0; transform: translateY(8px) scale(.97) } to { opacity: 1; transform: none } }

.rt-close {
  position: absolute;
  top: 14px;
  inset-inline-end: 14px;
  background: transparent;
  border: none;
  color: ${colors.gray};
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 6px;
}
.rt-close:hover { color: ${colors.white}; }

.rt-brand {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(135deg, ${colors.blueLight}, ${colors.blue});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.rt-archetype {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 4px 10px;
  border-radius: 100px;
  margin-bottom: 12px;
}

.rt-icon { font-size: 32px; margin-bottom: 8px; }

.rt-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -.5px;
  margin-bottom: 4px;
}
.rt-sub { font-size: 13px; color: ${colors.gray}; margin-bottom: 18px; }

.rt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 18px;
  text-align: start;
}
.rt-item-img {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: ${colors.navy3};
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}
.rt-item-img img { width: 100%; height: 100%; object-fit: cover; }
.rt-item-info { flex: 1; min-width: 0; }
.rt-item-title {
  font-size: 13px;
  font-weight: 600;
  color: ${colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rt-item-meta {
  font-size: 11px;
  color: ${colors.gray};
  margin-top: 2px;
}
.rt-item-price {
  font-size: 17px;
  font-weight: 900;
}

.rt-countdown-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
}
.rt-countdown-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.rt-countdown-svg circle { fill: none; }
.rt-countdown-track { stroke: rgba(255,255,255,.08); stroke-width: 4; }
.rt-countdown-prog {
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
.rt-countdown-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
}
.rt-countdown-label {
  font-size: 10px;
  color: ${colors.gray};
  letter-spacing: .5px;
  margin-bottom: 16px;
}

.rt-ai-card {
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
  text-align: start;
}
.rt-ai-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
  margin-bottom: 6px;
}
.rt-ai-body { font-size: 12px; line-height: 1.55; color: #cbd5e1; }
.rt-ai-body strong { color: ${colors.white}; }

.rt-alt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(34,197,94,.1);
  border: 1px solid rgba(34,197,94,.25);
  color: #d3fbe1;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 100px;
  margin-bottom: 16px;
}

.rt-btns { display: flex; flex-direction: column; gap: 8px; }
.rt-btn {
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: all .15s ease;
}
.rt-btn:disabled { opacity: .5; cursor: not-allowed; }
.rt-btn-primary { color: ${colors.white}; }
.rt-btn-primary:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.1); }
.rt-btn-save {
  background: transparent;
  color: ${colors.white};
  border-color: rgba(255,255,255,.18);
}
.rt-btn-save:hover { border-color: rgba(255,255,255,.4); }
.rt-btn-cancel {
  background: transparent;
  color: ${colors.gray};
  border: none;
  padding: 8px;
  font-size: 12px;
}
.rt-btn-cancel:hover { color: ${colors.white}; }

[dir="rtl"] .rt-countdown-svg { transform: rotate(-90deg) scaleX(-1); }

.rt-confirm-overlay {
  position: absolute;
  inset: 0;
  background: ${colors.navy2};
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  animation: rt-fadein .25s ease;
}
.rt-confirm-icon { font-size: 42px; margin-bottom: 12px; }
.rt-confirm-title { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
.rt-confirm-sub { font-size: 13px; color: ${colors.gray}; margin-bottom: 18px; }
.rt-confirm-amount { font-size: 36px; font-weight: 900; color: ${colors.green}; margin-bottom: 4px; }
.rt-confirm-label { font-size: 11px; color: ${colors.gray}; margin-bottom: 14px; }
.rt-confirm-badge {
  background: rgba(34,197,94,.12);
  border: 1px solid rgba(34,197,94,.28);
  color: ${colors.green};
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 100px;
}
`;
