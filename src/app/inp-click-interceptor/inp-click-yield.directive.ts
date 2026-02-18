import { booleanAttribute, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

import { INP_CLICK_INTERCEPT_ATTRIBUTE } from './inp-click-interceptor.constants';

@Directive({
  selector: '[inpClickYield]',
  standalone: true,
})
export class InpClickYieldDirective implements OnInit {
  private enabled = true;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  @Input({ alias: 'inpClickYield', transform: booleanAttribute })
  set inpClickYield(value: boolean) {
    this.enabled = value;
    this.syncInterceptAttribute();
  }

  ngOnInit(): void {
    this.syncInterceptAttribute();
  }

  private syncInterceptAttribute(): void {
    if (this.enabled) {
      this.renderer.setAttribute(this.elementRef.nativeElement, INP_CLICK_INTERCEPT_ATTRIBUTE, '');
      return;
    }

    this.renderer.removeAttribute(this.elementRef.nativeElement, INP_CLICK_INTERCEPT_ATTRIBUTE);
  }
}
