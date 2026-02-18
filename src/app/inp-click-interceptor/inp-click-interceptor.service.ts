import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';

import { INP_CLICK_INTERCEPTOR_CONFIG, InpClickInterceptorConfig } from './inp-click-interceptor.config';
import { INP_CLICK_INTERCEPT_SELECTOR } from './inp-click-interceptor.constants';

@Injectable({
  providedIn: 'root',
})
export class InpClickInterceptorService implements OnDestroy {
  private readonly interceptSelector = INP_CLICK_INTERCEPT_SELECTOR;
  private readonly eventListenerOptions: AddEventListenerOptions = {
    capture: true,
    passive: false,
  };

  private initialized = false;
  private isReplayingClick = false;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(INP_CLICK_INTERCEPTOR_CONFIG) private readonly config: InpClickInterceptorConfig,
    private readonly zone: NgZone,
  ) {}

  init(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initialized = true;

    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('click', this.handleCapturedClick, this.eventListenerOptions);
    });

    this.log('Interceptor ready');
  }

  ngOnDestroy(): void {
    if (!this.initialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.removeEventListener('click', this.handleCapturedClick, true);
    this.initialized = false;
  }

  private readonly handleCapturedClick = (event: MouseEvent): void => {
    if (this.isReplayingClick || !event.isTrusted || event.button !== 0 || !(event.target instanceof Element)) {
      return;
    }

    const matchedElement = event.target.closest(this.interceptSelector);
    if (!matchedElement) {
      return;
    }

    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      event.preventDefault();
    } catch {
      // Some event patching layers can still throw here; safe to ignore.
    }

    const replayTarget = event.target;
    const eventInit = this.createEventInit(event);

    matchedElement.classList.add(this.config.loadingClass);
    this.log('Intercepted click. Yielding for paint.', matchedElement);

    this.deferByAnimationFrames(this.config.yieldFrames, () => {
      this.isReplayingClick = true;
      this.log('Re-dispatching click.');

      const dispatchTarget = replayTarget.isConnected ? replayTarget : matchedElement;
      dispatchTarget.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: this.document.defaultView,
          ...eventInit,
        }),
      );

      this.isReplayingClick = false;

      const timeout = Math.max(0, this.config.loadingClassRemovalDelayMs);
      this.getWindow().setTimeout(() => {
        matchedElement.classList.remove(this.config.loadingClass);
      }, timeout);
    });
  };

  private createEventInit(event: MouseEvent): MouseEventInit {
    return {
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      detail: event.detail,
    };
  }

  private deferByAnimationFrames(frameCount: number, callback: () => void): void {
    const frames = Math.max(0, Math.floor(frameCount));
    if (frames === 0) {
      callback();
      return;
    }

    const raf = this.getWindow().requestAnimationFrame.bind(this.getWindow());
    const schedule = (remaining: number): void => {
      raf(() => {
        if (remaining <= 1) {
          callback();
          return;
        }
        schedule(remaining - 1);
      });
    };

    schedule(frames);
  }

  private log(message: string, ...args: unknown[]): void {
    if (!this.config.debug) {
      return;
    }

    const now = this.getWindow().performance.now().toFixed(2);
    console.log('[INP]', now, message, ...args);
  }

  private getWindow(): Window {
    const win = this.document.defaultView;
    if (!win) {
      throw new Error('Window is not available for INP click interception.');
    }
    return win;
  }
}
