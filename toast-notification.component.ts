import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class ToastNotificationComponent implements OnDestroy, AfterViewInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public toastItems$: Observable<Toast[]>;
  private animatedElements = new WeakSet<HTMLElement>();
  private observer?: MutationObserver;

  @Input()
  public mode?: 'light' | 'dark' = 'light';

  @ViewChild('toastContainer', { static: false }) toastContainer?: ElementRef<HTMLDivElement>;

  constructor(private pageService: PageService) {
    this.toastItems$ = this.pageService.store.pipe(selectToastItems).pipe(
      map((toastItems) => [...toastItems].reverse()),
      takeUntil(this.destroy$),
    );
  }

  ngAfterViewInit() {
    if (!this.toastContainer?.nativeElement) return;

    // Use MutationObserver to detect when new toast items are added to the DOM
    this.observer = new MutationObserver(() => {
      this.animateNewItems();
    });

    this.observer.observe(this.toastContainer.nativeElement, {
      childList: true,
      subtree: false,
    });

    // Initial check for existing items
    this.animateNewItems();
  }

  private animateNewItems() {
    if (!this.toastContainer?.nativeElement) return;

    const items = Array.from(
      this.toastContainer.nativeElement.querySelectorAll('app-toast-notification-item')
    ) as HTMLElement[];

    items.forEach((item) => {
      if (!this.animatedElements.has(item)) {
        // Use double requestAnimationFrame to ensure the element is fully rendered
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            item.classList.add('toast-enter');
            this.animatedElements.add(item);
          });
        });
      }
    });
  }

  /**
   * destroy component
   */
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
