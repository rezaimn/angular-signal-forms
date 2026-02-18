import {
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { InpOptimizeService } from './inp-optimize.service';

/**
 * Container-level INP optimization with CSS selectors.
 *
 * Intercepts clicks on any descendant matching the given selectors,
 * scoped to this container element. This is the Angular equivalent
 * of the global selector-based script approach but with proper
 * scoping and lifecycle management.
 *
 * @example
 * ```html
 * <!-- Scope interception to this section -->
 * <section inpOptimizeContainer
 *          [inpSelectors]="['.game', 'a.link-teaser', '[label=main-header-login-button]']">
 *   <a class="link-teaser" (click)="navigate()">Go</a>
 *   <div class="game" (click)="play()">Play</div>
 * </section>
 *
 * <!-- Or without scoping (matches anywhere in document) -->
 * <div inpOptimizeContainer
 *      [inpSelectors]="selectors"
 *      [inpScoped]="false">
 * </div>
 * ```
 */
@Directive({
  selector: '[inpOptimizeContainer]',
  standalone: true,
})
export class InpOptimizeContainerDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly inpService = inject(InpOptimizeService);
  private readonly destroyRef = inject(DestroyRef);

  /** CSS selectors to intercept */
  @Input({ required: true }) inpSelectors: string[] = [];

  /** Whether to scope matching to descendants of this container. Default: true */
  @Input() inpScoped = true;

  ngOnInit(): void {
    const scope = this.inpScoped ? this.el.nativeElement : undefined;
    const teardown = this.inpService.registerSelectors(
      this.inpSelectors,
      scope,
    );
    this.destroyRef.onDestroy(teardown);
  }
}
