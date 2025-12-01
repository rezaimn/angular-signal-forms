import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { WindowService } from '@matrix-game-widget/lib/services/utilities/window.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-money-type-display-modal',
  templateUrl: './money-type-display-modal.component.html',
  styleUrls: ['./money-type-display-modal.component.scss'],
  imports: [CommonModule, TranslateModule],
})
export class MoneyTypeDisplayModal implements AfterViewInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private animationFrameId: number;
  private isClosing = false;

  /**
   * Original code: stop the event propagation only if the popup is visible
   * Original code: override the key down event so we can disable the game keyboard bindings when the popup is shown
   * David: this is not hook yet to anything. We will have to wait until testing and click keydown and check what happens
   *
   * @param event
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (event.stopPropagation !== undefined) {
      event.stopPropagation();
      event.cancelBubble = true;
    }
  }

  @Input() public data: {
    moneyTypeText: string;
    moneyTypeColor?: string;
    displayTime?: number;
  };

  @Output() public modalEvent: EventEmitter<{ action: '' }> = new EventEmitter();

  constructor(
    private el: ElementRef,
    private windowService: WindowService,
  ) {}

  ngAfterViewInit() {
    this.el.nativeElement.focus();
    this.animationFrameId = this.windowService.window.requestAnimationFrame(() => {
      // Trigger enter animation - use setTimeout to ensure DOM is ready
      this.windowService.window.setTimeout(() => {
        const wrapper = this.el.nativeElement.querySelector('#moneytypewrapper');
        if (wrapper) {
          wrapper.classList.add('animate-in');
        }
      }, 0);
      this.startDisplayTimer();
    });
  }

  startDisplayTimer() {
    this.windowService.window.setTimeout(() => {
      this.closeModal();
    }, this.data.displayTime || 5000);
  }

  closeModal() {
    if (this.isClosing) return;
    this.isClosing = true;
    
    const wrapper = this.el.nativeElement.querySelector('#moneytypewrapper');
    if (wrapper) {
      // Add animate-out first to trigger transition, then remove animate-in
      wrapper.classList.add('animate-out');
      // Use requestAnimationFrame to ensure the animate-out class is applied before removing animate-in
      this.windowService.window.requestAnimationFrame(() => {
        wrapper.classList.remove('animate-in');
      });
    }
    
    // Emit event after animation completes
    this.windowService.window.setTimeout(() => {
      this.modalEvent.emit({ action: '' });
    }, 800); // Match animation duration
  }

  // David: We need to focus this modal when it is open
  // ORIGINAL NRGS: data-bind="visible: showRealityCheck, hasFocus: focusRealityCheck"
  /**
   * Clean component
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.animationFrameId) {
      this.windowService.window.cancelAnimationFrame(this.animationFrameId);
    }
  }
}
