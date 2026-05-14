import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { FrictionScreen, type FrictionScreenProps } from '@rethink/friction-screen';
import heStrings from '@rethink/shared/i18n/he';
import enStrings from '@rethink/shared/i18n/en';

let hostEl: HTMLElement | null = null;
let root: Root | null = null;

export interface MountArgs extends Omit<FrictionScreenProps, 'strings'> {
  onDecision: FrictionScreenProps['onDecision'];
}

export function mountFrictionOverlay(args: MountArgs) {
  unmount();

  hostEl = document.createElement('rethink-friction-host');
  hostEl.style.cssText = 'all: initial; position: fixed; inset: 0; z-index: 2147483647;';
  document.documentElement.appendChild(hostEl);

  const shadow = hostEl.attachShadow({ mode: 'closed' });
  const reactRoot = document.createElement('div');
  shadow.appendChild(reactRoot);
  root = createRoot(reactRoot);

  const strings = args.locale === 'he' ? heStrings.friction : enStrings.friction;

  const wrappedOnDecision: FrictionScreenProps['onDecision'] = (outcome) => {
    args.onDecision(outcome);
    setTimeout(unmount, outcome === 'saved' ? 1900 : 50);
  };

  root.render(
    createElement(FrictionScreen, {
      ...args,
      strings,
      onDecision: wrappedOnDecision,
      onClose: () => {
        args.onClose?.();
        setTimeout(unmount, 0);
      },
    })
  );
}

export function unmount() {
  if (root) {
    try { root.unmount(); } catch {}
    root = null;
  }
  if (hostEl?.parentNode) {
    hostEl.parentNode.removeChild(hostEl);
  }
  hostEl = null;
}
