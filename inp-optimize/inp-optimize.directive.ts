import { Directive, DestroyRef, ElementRef, inject, OnInit } from '@angular/core';
import { InpOptimizeService } from './inp-optimize.service';

/**
 * Per-element INP optimization.
 *
 * Intercepts the first click, yields to the browser for a
 * paint frame (double rAF), then re-dispatches the click so
 * Angular handlers run after the browser has had a chance to
 * update the visual feedback — dramatically reducing INP.
 *
 * @example
 * ```html
 * <button inpOptimize (click)="doHeavyWork()">Save</button>
 * <a inpOptimize [routerLink]="['/page']">Navigate</a>
 * ```
 */
@Directive({
  selector: '[inpOptimize]',
  standalone: true,
})
export class InpOptimizeDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly inpService = inject(InpOptimizeService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.inpService.registerElement(this.el.nativeElement);
    this.destroyRef.onDestroy(() => {
      this.inpService.unregisterElement(this.el.nativeElement);
    });
  }
}
