import { booleanAttribute, Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[inpClickYield]',
  standalone: true,
})
export class InpClickYieldDirective {
  private enabled = true;

  @Input({ alias: 'inpClickYield', transform: booleanAttribute })
  set inpClickYield(value: boolean) {
    this.enabled = value;
  }

  @HostBinding('attr.data-inp-intercept')
  get dataInterceptAttribute(): '' | null {
    return this.enabled ? '' : null;
  }
}
