import { Component, input } from '@angular/core';
import { ModalBaseComponent } from '../../modal/modal-base/modal-base';
import type { ModalActionBase, ModalContentSlots } from '../../modal/modal.types';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export type ConfirmDialogAction =
  | { type: 'close'; source: 'backdrop' | 'escape' | 'button' }
  | { type: 'button'; buttonId: 'confirm'; payload?: unknown }
  | { type: 'button'; buttonId: 'cancel' };

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalBaseComponent],
  template: `
    <app-modal-base [content]="modalContent()" [emit]="modalActions()">
      <div class="confirm-dialog">
        <h2>{{ modalData()?.title }}</h2>
        <p>{{ modalData()?.message }}</p>
        <div class="confirm-dialog__actions">
          <button type="button" (click)="onCancel()">
            {{ modalData()?.cancelLabel ?? 'Cancel' }}
          </button>
          <button type="button" (click)="onConfirm()">
            {{ modalData()?.confirmLabel ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </app-modal-base>
  `,
  styles: `
    .confirm-dialog h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }

    .confirm-dialog p {
      margin: 0 0 1rem;
      color: #666;
    }

    .confirm-dialog__actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
    }

    button:last-child {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  `,
})
export class ConfirmDialogComponent {
  readonly modalData = input<ConfirmDialogData>();
  readonly modalActions = input<(action: ConfirmDialogAction) => void>();
  readonly modalContent = input<ModalContentSlots>();

  onCancel(): void {
    this.modalActions()?.({ type: 'button', buttonId: 'cancel' });
  }

  onConfirm(): void {
    this.modalActions()?.({ type: 'button', buttonId: 'confirm' });
  }
}
