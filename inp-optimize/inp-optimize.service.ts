import { inject, Injectable, NgZone } from '@angular/core';
import {
  INP_OPTIMIZE_CONFIG,
  INP_OPTIMIZE_DEFAULTS,
  InpOptimizeConfig,
} from './inp-optimize.config';

interface SelectorEntry {
  selectors: string;
  scope?: HTMLElement;
}

@Injectable({ providedIn: 'root' })
export class InpOptimizeService {
  private readonly ngZone = inject(NgZone);
  private readonly config: Required<InpOptimizeConfig>;

  private readonly elements = new Set<HTMLElement>();
  private readonly selectorEntries: SelectorEntry[] = [];
  private listenerAttached = false;
  private isIntercepting = false;
  private styleInjected = false;

  constructor() {
    const injected = inject(INP_OPTIMIZE_CONFIG, { optional: true });
    this.config = { ...INP_OPTIMIZE_DEFAULTS, ...injected };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Whether a re-dispatch is currently in flight (used by directives) */
  get intercepting(): boolean {
    return this.isIntercepting;
  }

  /** Register a single element for interception (used by InpOptimizeDirective) */
  registerElement(el: HTMLElement): void {
    this.elements.add(el);
    this.ensureListener();
  }

  /** Unregister an element */
  unregisterElement(el: HTMLElement): void {
    this.elements.delete(el);
  }

  /** Register CSS selectors, optionally scoped to a container element */
  registerSelectors(selectors: string[], scope?: HTMLElement): () => void {
    const entry: SelectorEntry = {
      selectors: selectors.join(', '),
      scope,
    };
    this.selectorEntries.push(entry);
    this.ensureListener();
    this.log('Selectors registered:', entry.selectors);
    return () => {
      const idx = this.selectorEntries.indexOf(entry);
      if (idx !== -1) this.selectorEntries.splice(idx, 1);
    };
  }

  // ---------------------------------------------------------------------------
  // Core interception
  // ---------------------------------------------------------------------------

  private findTarget(eventTarget: HTMLElement): HTMLElement | null {
    for (const el of this.elements) {
      if (el === eventTarget || el.contains(eventTarget)) return el;
    }
    for (const entry of this.selectorEntries) {
      const match = eventTarget.closest(entry.selectors) as HTMLElement | null;
      if (match && (!entry.scope || entry.scope.contains(match))) return match;
    }
    return null;
  }

  private interceptClick(event: MouseEvent, target: HTMLElement): void {
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      event.preventDefault();
    } catch {
      /* Zone.js may enforce passive listeners */
    }

    const originalHref = target.getAttribute('href');
    if (originalHref) target.removeAttribute('href');

    const originalTarget = event.target as HTMLElement;
    const eventProps: MouseEventInit = {
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true,
      cancelable: true,
      view: window,
    };

    target.classList.add(this.config.loadingClass);
    this.log('Intercepted click, yielding for paint');

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (originalHref) target.setAttribute('href', originalHref);

          this.isIntercepting = true;
          this.log('Re-dispatching click');
          originalTarget.dispatchEvent(new MouseEvent('click', eventProps));
          this.isIntercepting = false;

          setTimeout(() => {
            target.classList.remove(this.config.loadingClass);
          }, this.config.loadingDuration);
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Listener bootstrap & styles
  // ---------------------------------------------------------------------------

  private ensureListener(): void {
    if (this.listenerAttached) return;
    this.listenerAttached = true;
    this.injectStyles();

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener(
        'click',
        (e: Event) => {
          if (this.isIntercepting) return;
          const eventTarget = e.target as HTMLElement;
          if (!eventTarget?.closest) return;
          const target = this.findTarget(eventTarget);
          if (!target) return;
          this.interceptClick(e as MouseEvent, target);
        },
        { capture: true, passive: false },
      );
    });

    this.log('Document capture listener attached');
  }

  private injectStyles(): void {
    if (this.styleInjected) return;
    this.styleInjected = true;
    const cls = this.config.loadingClass;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes inp-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .${cls} {
        animation: inp-pulse 0.8s ease-in-out infinite;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[INP]', performance.now().toFixed(2), ...args);
    }
  }
}
