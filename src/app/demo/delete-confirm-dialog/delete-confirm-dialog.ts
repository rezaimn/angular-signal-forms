import { Component, input } from '@angular/core';
import { ModalBaseComponent } from '../../modal/modal-base/modal-base';
import { UserAvatarComponent } from '../user-avatar/user-avatar';
import type { ModalActionBase, ModalContentSlots } from '../../modal/modal.types';

export interface DeleteConfirmData {
  itemName: string;
  user?: { name: string; email: string };
}

export type DeleteConfirmAction =
  | { type: 'close'; source: 'backdrop' | 'escape' | 'button' }
  | { type: 'button'; buttonId: 'delete' }
  | { type: 'button'; buttonId: 'cancel' };

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [ModalBaseComponent, UserAvatarComponent],
  template: `
    <app-modal-base [content]="modalContent()" [emit]="modalActions()">
      <div class="delete-confirm">
        <h2>Delete "{{ modalData()?.itemName }}"?</h2>
        <p>This action cannot be undone.</p>
        @if (modalData()?.user) {
          <app-user-avatar [user]="modalData()!.user" />
        }
        <div class="delete-confirm__actions">
          <button type="button" (click)="onCancel()">Cancel</button>
          <button type="button" class="danger" (click)="onDelete()">Delete</button>
        </div>
      </div>
    </app-modal-base>
  `,
  styles: `
    .delete-confirm h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }

    .delete-confirm p {
      margin: 0 0 1rem;
      color: #666;
    }

    .delete-confirm__actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
    }

    button.danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
  `,
})
export class DeleteConfirmDialogComponent {
  readonly modalData = input<DeleteConfirmData>();
  readonly modalActions = input<(action: DeleteConfirmAction) => void>();
  readonly modalContent = input<ModalContentSlots>();

  onCancel(): void {
    this.modalActions()?.({ type: 'button', buttonId: 'cancel' });
  }

  onDelete(): void {
    this.modalActions()?.({ type: 'button', buttonId: 'delete' });
  }
}
