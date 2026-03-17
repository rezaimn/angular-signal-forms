import { Component, computed, effect, inject, HostListener, signal } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ModalQueueStore } from '../modal.store';
import { ModalService } from '../modal.service';
import type { ModalAction, ModalEntry } from '../modal.types';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet],
  template: `
    @if (topModal(); as modal) {
      <div
        class="modal-backdrop"
        [class.modal-backdrop--visible]="isVisible()"
        (click)="onBackdropClick($event)"
      >
        <div
          class="modal-dialog"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-content">
            @if (modal.config.content?.header) {
              <header class="modal-header">
                <ng-container [ngTemplateOutlet]="modal.config.content!.header!" />
              </header>
            }
            <div class="modal-body">
              <ng-container
                [ngComponentOutlet]="modal.config.component"
                [ngComponentOutletInputs]="getModalInputs(modal)"
              />
              @if (modal.config.content?.body) {
                <ng-container [ngTemplateOutlet]="modal.config.content!.body!" />
              }
            </div>
            @if (modal.config.content?.footer) {
              <footer class="modal-footer">
                <ng-container [ngTemplateOutlet]="modal.config.content!.footer!" />
              </footer>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }

    .modal-backdrop--visible {
      opacity: 1;
      visibility: visible;
    }

    .modal-dialog {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    }

    .modal-content {
      padding: 1.5rem;
      min-width: 320px;
    }

    .modal-header {
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .modal-body {
      margin-bottom: 1rem;
    }

    .modal-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `,
})
export class ModalContainerComponent {
  private readonly store = inject(ModalQueueStore);
  private readonly modalService = inject(ModalService);

  readonly topModal = computed(() => this.store.modals()[0]);
  readonly isVisible = signal(true);

  private currentModalId: string | null = null;

  constructor() {
    effect(() => {
      const modal = this.topModal();
      if (modal) {
        this.currentModalId = modal.id;
        this.isVisible.set(true);
      } else {
        this.currentModalId = null;
      }
    });
  }


  @HostListener('document:keydown.escape')
  onEscape(): void {
    const modal = this.topModal();
    if (!modal || modal.config.closeOnEscape === false) return;
    this.modalService.emitAction(modal.id, { type: 'close', source: 'escape' });
  }

  onBackdropClick(event: Event): void {
    const modal = this.topModal();
    if (!modal || modal.config.closeOnBackdrop === false) return;
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalService.emitAction(modal.id, { type: 'close', source: 'backdrop' });
    }
  }

  handleAction(id: string, action: ModalAction): void {
    this.modalService.emitAction(id, action);
  }

  getModalInputs(modal: ModalEntry): Record<string, unknown> {
    return {
      modalData: modal.config.data,
      modalActions: (action: ModalAction) => this.handleAction(modal.id, action),
      modalContent: modal.config.content,
    };
  }
}
