import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog';
import type { ConfirmDialogAction } from '../confirm-dialog/confirm-dialog';
import type { DeleteConfirmAction } from '../delete-confirm-dialog/delete-confirm-dialog';

@Component({
  selector: 'app-modal-demo',
  standalone: true,
  template: `
    <div class="demo-actions">
      <button type="button" (click)="openConfirm()">Open Confirm Dialog</button>
      <button type="button" (click)="openDeleteWithChild()">Open Delete (with UserAvatar child)</button>
      <button type="button" (click)="openPriorityModals()">Open 2 modals (priority demo)</button>
    </div>
    @if (lastAction) {
    <div class="demo-log">
      <strong>Last action:</strong> {{ lastAction }}
    </div>
    }
  `,
  styles: `
    .demo-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
    }

    button:hover {
      background: #f5f5f5;
    }

    .demo-log {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0f9ff;
      border-radius: 4px;
      font-family: monospace;
    }
  `,
})
export class ModalDemoComponent {
  private readonly modal = inject(ModalService);
  lastAction = '';

  openConfirm(): void {
    const ref = this.modal.open<
      { title: string; message: string; confirmLabel?: string; cancelLabel?: string },
      ConfirmDialogAction
    >({
      component: ConfirmDialogComponent,
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
      },
    });

    ref.actions$.subscribe((action) => {
      this.lastAction = JSON.stringify(action);
      if (action.type === 'button' && action.buttonId === 'confirm') {
        console.log('User confirmed!');
      } else if (action.type === 'button' && action.buttonId === 'cancel') {
        console.log('User cancelled');
      }
    });
  }

  openDeleteWithChild(): void {
    const ref = this.modal.open<
      { itemName: string; user?: { name: string; email: string } },
      DeleteConfirmAction
    >({
      component: DeleteConfirmDialogComponent,
      data: {
        itemName: 'Important Document',
        user: { name: 'Jane Doe', email: 'jane@example.com' },
      },
    });

    ref.actions$.subscribe((action) => {
      this.lastAction = JSON.stringify(action);
      if (action.type === 'button' && action.buttonId === 'delete') {
        console.log('User deleted the item');
      }
    });
  }

  openPriorityModals(): void {
    const lowRef = this.modal.open({
      component: ConfirmDialogComponent,
      data: { title: 'Low Priority', message: 'I am behind the high priority modal.' },
      priority: 0,
    });

    const highRef = this.modal.open({
      component: ConfirmDialogComponent,
      data: { title: 'High Priority', message: 'I appear first!' },
      priority: 10,
    });

    highRef.actions$.subscribe(() => {
      this.lastAction = 'High priority modal closed';
    });
    lowRef.actions$.subscribe(() => {
      this.lastAction = 'Low priority modal closed';
    });
  }
}
