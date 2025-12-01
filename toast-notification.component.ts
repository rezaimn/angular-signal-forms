import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
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
export class ToastNotificationComponent implements OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public toastItems$: Observable<Toast[]>;

  @Input()
  public mode?: 'light' | 'dark' = 'light';

  constructor(private pageService: PageService) {
    this.toastItems$ = this.pageService.store.pipe(selectToastItems).pipe(
      map((toastItems) => [...toastItems].reverse()),
      takeUntil(this.destroy$),
    );
  }

  /**
   * destroy component
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
