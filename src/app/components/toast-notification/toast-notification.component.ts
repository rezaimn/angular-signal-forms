import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { PageService } from '@app-core/page/page.service';
import { Toast, selectToastItems } from '@app-main/reducers/toast.reducer';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ToastNotificationItemComponent } from './toast-notification-item/toast-notification-item.component';

interface ToastListItem {
  id: string | number;
  toast: Toast;
  animateIn: boolean;
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  imports: [ToastNotificationItemComponent, CommonModule],
})
export class ToastNotificationComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private previousToastIds = new Set<string | number>();
  private toastIdentity = new WeakMap<Toast, string>();

  public toastItems$: Observable<ToastListItem[]>;

  @Input()
  public mode?: 'light' | 'dark' = 'light';

  constructor(private pageService: PageService) {
    this.toastItems$ = this.pageService.store.pipe(selectToastItems).pipe(
      map((toastItems) => {
        const reversedItems = [...toastItems].reverse();
        const activeIds = new Set<string | number>();

        const listItems = reversedItems.map((toast, index) => {
          const id = this.resolveToastId(toast, index);
          activeIds.add(id);
          const animateIn = !this.previousToastIds.has(id);

          return {
            id,
            toast,
            animateIn,
          } satisfies ToastListItem;
        });

        this.previousToastIds = activeIds;
        return listItems;
      }),
      takeUntil(this.destroy$),
    );
  }

  public trackByToastId = (_: number, item: ToastListItem): string | number => item.id;

  private resolveToastId(toast: Toast, fallbackIndex: number): string | number {
    const candidate =
      (toast as { id?: string | number }).id ??
      (toast as { toastId?: string | number }).toastId ??
      (toast as { uuid?: string | number }).uuid ??
      (toast as { key?: string | number }).key ??
      (toast as { createdAt?: string | number }).createdAt ??
      (toast as { timestamp?: string | number }).timestamp;

    if (candidate !== undefined && candidate !== null) {
      return candidate;
    }

    if (!this.toastIdentity.has(toast)) {
      const generatedId = `toast-${Date.now()}-${fallbackIndex}-${Math.random()
        .toString(36)
        .slice(2)}`;
      this.toastIdentity.set(toast, generatedId);
    }

    return this.toastIdentity.get(toast)!;
  }

  /**
   * destroy component
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
