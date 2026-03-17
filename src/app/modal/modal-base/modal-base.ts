import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ModalActionBase, ModalContentSlots } from '../modal.types';

/**
 * Base modal wrapper with content projection slots.
 * Use in your modal components to render header/body/footer and project child components.
 */
@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (content()?.header) {
      <header class="modal-base__header">
        <ng-container [ngTemplateOutlet]="content()!.header!" />
      </header>
    }
    <div class="modal-base__body">
      <ng-content />
      @if (content()?.body) {
        <ng-container [ngTemplateOutlet]="content()!.body!" />
      }
    </div>
    @if (content()?.footer) {
      <footer class="modal-base__footer">
        <ng-container [ngTemplateOutlet]="content()!.footer!" />
      </footer>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .modal-base__header {
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .modal-base__body {
      margin-bottom: 1rem;
    }

    .modal-base__footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `,
})
export class ModalBaseComponent<TAction extends ModalActionBase = ModalActionBase> {
  readonly content = input<ModalContentSlots>();
  readonly emit = input<(action: TAction) => void>();
}
