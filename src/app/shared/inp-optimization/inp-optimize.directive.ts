import { Directive, HostListener, Inject, Optional, Input } from '@angular/core';
import { INP_OPTIMIZATION_CONFIG, InpOptimizationConfig } from './inp-optimization.config';

/**
 * Directive that optimizes INP by yielding to paint before handling clicks.
 * Attach to any clickable element: buttons, links, divs with click handlers.
 *
 * @example
 * <button inpOptimize>Click me</button>
 * <a href="/path" inpOptimize>Link</a>
 */
@Directive({
  selector: '[inpOptimize]',
  standalone: true,
})
export class InpOptimizeDirective {
  @Input() inpOptimize: boolean | string = true;

  private isIntercepting = false;

  constructor(
    @Optional() @Inject(INP_OPTIMIZATION_CONFIG) private config: InpOptimizationConfig
  ) {
    if (!this.config) {
      this.config = {
        selectors: [],
        loadingClass: 'inp-loading',
        loadingDuration: 2000,
        debug: false,
      };
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.inpOptimize === false || this.inpOptimize === 'false') return;
    if (this.isIntercepting) return;

    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      event.preventDefault();
    } catch {
      /* Zone.js passive */
    }

    const target = event.currentTarget as HTMLElement;
    const originalHref = target.getAttribute('href');
    if (originalHref) target.removeAttribute('href');

    const eventProps = {
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
    };

    target.classList.add(this.config.loadingClass);
    if (this.config.debug) {
      console.log('[INP]', performance.now().toFixed(2), 'Intercepted, yielding for paint');
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (originalHref) target.setAttribute('href', originalHref);
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
  }
}
