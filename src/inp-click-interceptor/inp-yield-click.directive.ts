import { Directive, ElementRef, HostListener, Input, NgZone } from '@angular/core';

export interface InpYieldClickOptions {
  yieldFrames?: number;
  loadingClass?: string;
  loadingTimeoutMs?: number;
  debug?: boolean;
}

/**
 * Per-element alternative to the global (selector-based) interceptor.
 *
 * Usage:
 *   <a inpYieldClick>...</a>
 *   <button [inpYieldClick]="{ yieldFrames: 2 }">...</button>
 */
@Directive({
  selector: '[inpYieldClick]',
  standalone: true,
})
export class InpYieldClickDirective {
  @Input('inpYieldClick') options: InpYieldClickOptions | '' = '';

  private isReplaying = false;
  private removeLoadingTimer: number | null = null;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.isReplaying) return;

    const opts = normalizeOptions(this.options);
    const yieldFrames = Math.max(0, opts.yieldFrames ?? 2);
    const loadingClass = (opts.loadingClass ?? 'inp-loading').trim();
    const loadingTimeoutMs = Math.max(0, opts.loadingTimeoutMs ?? 2000);
    const debug = Boolean(opts.debug);

    const log = (...args: unknown[]) => {
      if (!debug) return;
      // eslint-disable-next-line no-console
      console.log('[INP]', performance.now().toFixed(2), ...args);
    };

    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      event.preventDefault();
    } catch {
      // noop
    }

    const el = this.host.nativeElement;
    const originalHref = el.getAttribute('href');
    if (originalHref != null) el.removeAttribute('href');

    if (loadingClass) {
      el.classList.add(loadingClass);
      if (this.removeLoadingTimer != null) window.clearTimeout(this.removeLoadingTimer);
      this.removeLoadingTimer = window.setTimeout(() => {
        el.classList.remove(loadingClass);
        this.removeLoadingTimer = null;
      }, loadingTimeoutMs);
    }

    const replayProps = pickMouseEventReplayProps(event);

    this.zone.runOutsideAngular(() => {
      log('Intercepted, yielding for paint', { yieldFrames });
      yieldForFrames(yieldFrames).then(() => {
        if (originalHref != null) el.setAttribute('href', originalHref);

        this.isReplaying = true;
        log('Re-dispatching click');
        try {
          el.dispatchEvent(
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
    });
  }
}

function normalizeOptions(value: InpYieldClickOptions | ''): InpYieldClickOptions {
  if (value === '') return {};
  return value ?? {};
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

