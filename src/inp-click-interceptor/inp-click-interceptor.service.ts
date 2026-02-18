import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import {
  INP_CLICK_INTERCEPTOR_CONFIG,
  InpClickInterceptorConfig,
} from './inp-click-interceptor.config';

type CleanupFn = () => void;

@Injectable({ providedIn: 'root' })
export class InpClickInterceptorService {
  private cleanup: CleanupFn | null = null;
  private initialized = false;
  private isReplaying = false;
  private readonly removeLoadingTimers = new WeakMap<Element, number>();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly zone: NgZone,
    @Inject(INP_CLICK_INTERCEPTOR_CONFIG)
    private readonly config: InpClickInterceptorConfig,
  ) {}

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (!isPlatformBrowser(this.platformId)) return;

    const selectors = (this.config.selectors ?? []).map((s) => s.trim()).filter(Boolean);
    if (selectors.length === 0) return;

    const selectorText = selectors.join(', ');
    const yieldFrames = Math.max(0, this.config.yieldFrames ?? 2);
    const loadingClass = (this.config.loadingClass ?? 'inp-loading').trim();
    const loadingTimeoutMs = Math.max(0, this.config.loadingTimeoutMs ?? 2000);
    const debug = Boolean(this.config.debug);

    const log = (...args: unknown[]) => {
      if (!debug) return;
      // eslint-disable-next-line no-console
      console.log('[INP]', performance.now().toFixed(2), ...args);
    };

    this.zone.runOutsideAngular(() => {
      const handler = (event: MouseEvent) => {
        if (this.isReplaying) return;

        const rawTarget = event.target;
        if (!(rawTarget instanceof Element)) return;

        const matched = rawTarget.closest(selectorText);
        if (!matched) return;

        event.stopPropagation();
        event.stopImmediatePropagation();
        try {
          event.preventDefault();
        } catch {
          // Some environments can throw if the event is effectively passive.
        }

        const originalHref = matched.getAttribute('href');
        if (originalHref != null) matched.removeAttribute('href');

        if (loadingClass) {
          matched.classList.add(loadingClass);
          const existingTimer = this.removeLoadingTimers.get(matched);
          if (existingTimer != null) window.clearTimeout(existingTimer);
          const timer = window.setTimeout(() => {
            matched.classList.remove(loadingClass);
            this.removeLoadingTimers.delete(matched);
          }, loadingTimeoutMs);
          this.removeLoadingTimers.set(matched, timer);
        }

        const replayProps = pickMouseEventReplayProps(event);
        log('Intercepted, yielding for paint', { selectorText, yieldFrames });

        yieldForFrames(yieldFrames).then(() => {
          if (originalHref != null) matched.setAttribute('href', originalHref);

          this.isReplaying = true;
          log('Re-dispatching click');
          try {
            rawTarget.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
                ...replayProps,
              }),
            );
          } finally {
            this.isReplaying = false;
          }
        });
      };

      this.document.addEventListener('click', handler, { capture: true, passive: false });
      this.cleanup = () => this.document.removeEventListener('click', handler, true);
      log('Interceptor ready', { selectorText });
    });
  }

  destroy(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

function yieldForFrames(frames: number): Promise<void> {
  return new Promise((resolve) => {
    if (frames <= 0) return resolve();

    let remaining = frames;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function pickMouseEventReplayProps(event: MouseEvent): Partial<MouseEventInit> {
  return {
    altKey: event.altKey,
    button: event.button,
    buttons: event.buttons,
    clientX: event.clientX,
    clientY: event.clientY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    movementX: (event as MouseEvent).movementX,
    movementY: (event as MouseEvent).movementY,
    screenX: event.screenX,
    screenY: event.screenY,
    shiftKey: event.shiftKey,
  };
}

