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
import { TranslateModule } from '@ngx-translate/core';
import { WindowService } from '@matrix-game-widget/lib/services/utilities/window.service';

type MoneyTypeDisplayData = {
  moneyTypeText: string;
  moneyTypeColor?: string;
  displayTime?: number;
};

@Component({
  selector: 'app-money-type-display-modal',
  standalone: true,
  templateUrl: './money-type-display-modal.component.html',
  styleUrls: ['./money-type-display-modal.component.scss'],
  imports: [CommonModule, TranslateModule],
})
export class MoneyTypeDisplayModal implements AfterViewInit, OnDestroy {
  private static readonly ANIMATION_DURATION_MS = 800;

  @Input() public data: MoneyTypeDisplayData = {
    moneyTypeText: '',
  };

  @Output() public modalEvent: EventEmitter<{ action: '' }> = new EventEmitter();

  @HostBinding('class.is-visible') public isVisible = false;

  private animationFrameId?: number;
  private displayTimerId?: number;
  private exitTimerId?: number;
  private exitStarted = false;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly windowService: WindowService,
  ) {}

  /**
   * Original code: stop the event propagation only if the popup is visible
   * Original code: override the key down event so we can disable the game keyboard bindings when the popup is shown
   * David: this is not hook yet to anything. We will have to wait until testing and click keydown and check what happens
   *
   * @param event
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.stopPropagation !== undefined) {
      event.stopPropagation();
      event.cancelBubble = true;
    }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
    this.animationFrameId = this.windowService.window.requestAnimationFrame(() => {
      this.isVisible = true;
      this.startDisplayTimer();
    });
  }

  private startDisplayTimer(): void {
    const displayTime = this.data?.displayTime ?? 5000;
    this.displayTimerId = this.windowService.window.setTimeout(() => {
      this.startExitSequence();
    }, displayTime);
  }

  private startExitSequence(): void {
    if (this.exitStarted) {
      return;
    }

    this.exitStarted = true;
    this.isVisible = false;

    // Give the CSS transition time to finish before notifying the parent.
    this.exitTimerId = this.windowService.window.setTimeout(() => {
      this.modalEvent.emit({ action: '' });
    }, MoneyTypeDisplayModal.ANIMATION_DURATION_MS);
  }

  ngOnDestroy(): void {
    const { window } = this.windowService;

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    if (this.displayTimerId) {
      window.clearTimeout(this.displayTimerId);
    }

    if (this.exitTimerId) {
      window.clearTimeout(this.exitTimerId);
    }
  }
}
