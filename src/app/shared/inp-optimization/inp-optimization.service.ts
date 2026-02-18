import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  INP_OPTIMIZATION_CONFIG,
  InpOptimizationConfig,
} from './inp-optimization.config';

/**
 * Service that sets up document-level click interception for INP optimization.
 * Use when you need to optimize elements you can't attach the directive to
 * (e.g. dynamic content, third-party components) or prefer central config.
 *
 * Call init() in APP_INITIALIZER or your root component's constructor.
 */
@Injectable({ providedIn: 'root' })
export class InpOptimizationService {
  private isIntercepting = false;
  private initialized = false;

  constructor(
    @Inject(INP_OPTIMIZATION_CONFIG) private config: InpOptimizationConfig,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /**
   * Initialize document-level click interception.
   * Safe to call multiple times; will only register once.
   */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.initialized) return;

    const selectors = this.config.selectors.join(', ');
    if (!selectors) return;

    const handler = (e: Event) => {
      const target = (e.target as Element).closest(selectors);
      if (!target || this.isIntercepting) return;

      e.stopPropagation();
      e.stopImmediatePropagation();
      try {
        e.preventDefault();
      } catch {
        /* Zone.js passive */
      }

      const originalHref = (target as HTMLElement).getAttribute('href');
      if (originalHref) (target as HTMLElement).removeAttribute('href');

      const mouseEvent = e as MouseEvent;
      const eventProps = {
        ctrlKey: mouseEvent.ctrlKey,
        shiftKey: mouseEvent.shiftKey,
        altKey: mouseEvent.altKey,
        metaKey: mouseEvent.metaKey,
        button: mouseEvent.button,
        clientX: mouseEvent.clientX,
        clientY: mouseEvent.clientY,
      };

      target.classList.add(this.config.loadingClass);
      if (this.config.debug) {
        console.log(
          '[INP]',
          performance.now().toFixed(2),
          'Intercepted, yielding for paint'
        );
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (originalHref) (target as HTMLElement).setAttribute('href', originalHref);
          this.isIntercepting = true;

          if (this.config.debug) {
            console.log('[INP]', performance.now().toFixed(2), 'Re-dispatching click');
          }

          target.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              ...eventProps,
            })
          );

          this.isIntercepting = false;
          setTimeout(() => {
            target.classList.remove(this.config.loadingClass);
          }, this.config.loadingDuration);
        });
      });
    };

    document.addEventListener('click', handler, { capture: true, passive: false });
    this.initialized = true;

    if (this.config.debug) {
      console.log('[INP] Interceptor ready');
    }
  }

  /**
   * Add selectors to the config at runtime (before or after init).
   */
  addSelectors(...selectors: string[]): void {
    this.config.selectors.push(...selectors);
  }
}
