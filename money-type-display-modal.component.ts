import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
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
  private displayTimerId: number;

  @HostBinding('class.animate-in') animateIn = false;
  @HostBinding('class.animate-out') animateOut = false;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
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
      this.animateIn = true;
      this.startDisplayTimer();
    });
  }

  startDisplayTimer() {
    this.displayTimerId = this.windowService.window.setTimeout(() => {
      this.triggerExit();
    }, this.data.displayTime || 5000);
  }

  private triggerExit() {
    this.animateIn = false;
    this.animateOut = true;

    // Wait for exit animation to complete before emitting
    this.windowService.window.setTimeout(() => {
      this.modalEvent.emit({ action: '' });
    }, 800);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.animationFrameId) {
      this.windowService.window.cancelAnimationFrame(this.animationFrameId);
    }
    if (this.displayTimerId) {
      this.windowService.window.clearTimeout(this.displayTimerId);
    }
  }
}
