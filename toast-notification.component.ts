import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { PageService } from '@app-core/page/page.service';
import { Toast, selectToastItems } from '@app-main/reducers/toast.reducer';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ToastNotificationItemComponent } from './toast-notification-item/toast-notification-item.component';

@Component({
  selector: 'app-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  imports: [ToastNotificationItemComponent, CommonModule],
})
export class ToastNotificationComponent implements OnDestroy, AfterViewChecked {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private previousItemCount = 0;
  public toastItems$: Observable<Toast[]>;

  @Input()
  public mode?: 'light' | 'dark' = 'light';

  @ViewChildren(ToastNotificationItemComponent, { read: ElementRef })
  toastItemElements!: QueryList<ElementRef>;

  constructor(private pageService: PageService) {
    this.toastItems$ = this.pageService.store.pipe(selectToastItems).pipe(
      map((toastItems) => [...toastItems].reverse()),
      takeUntil(this.destroy$),
    );
  }

  ngAfterViewChecked() {
    const currentItemCount = this.toastItemElements.length;

    if (currentItemCount > this.previousItemCount) {
      // New items were added, animate the first item (most recent due to reverse)
      const newItems = this.toastItemElements.toArray().slice(0, currentItemCount - this.previousItemCount);

      newItems.forEach((item) => {
        const element = item.nativeElement as HTMLElement;
        // Remove any existing animation class
        element.classList.remove('toast-enter-animation');

        // Force reflow to restart animation
        void element.offsetWidth;

        // Add animation class
        element.classList.add('toast-enter-animation');
      });
    }

    this.previousItemCount = currentItemCount;
  }

  /**
   * destroy component
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
