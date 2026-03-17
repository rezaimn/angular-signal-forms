import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import type { ModalAction, ModalConfig, ModalEntry, ModalId } from './modal.types';
import { ModalQueueStore } from './modal.store';

let nextId = 0;

function generateModalId(): ModalId {
  return `modal-${++nextId}-${Date.now()}`;
}

/** Result of opening a modal - subscribe to actions from the caller */
export interface ModalRef<TAction extends ModalAction = ModalAction> {
  /** Emits when user closes modal or clicks a button. Completes when modal is dismissed. */
  readonly actions$: Observable<TAction>;
  /** Programmatically close the modal */
  close(): void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly store = inject(ModalQueueStore);

  /**
   * Open a modal. Returns a ref with actions$ - subscribe to react to close/button clicks.
   * Fully type-safe: TData flows to the component, TAction flows back to your subscription.
   */
  open<TData, TAction extends ModalAction>(
    config: ModalConfig<TData, TAction>
  ): ModalRef<TAction> {
    const id = generateModalId();
    const actionSubject = new Subject<TAction>();

    const entry: ModalEntry<TData, TAction> = {
      id,
      priority: config.priority ?? 0,
      config,
      actionSubject,
    };

    this.store.addModal(entry as unknown as ModalEntry);

    const close = () => {
      this.store.removeModal(id);
      actionSubject.complete();
    };

    return {
      actions$: actionSubject.asObservable(),
      close,
    };
  }

  /** Emit an action for a modal (called by modal components) */
  emitAction(id: ModalId, action: ModalAction): void {
    const entry = this.store.modals().find((m) => m.id === id);
    if (entry) {
      (entry.actionSubject as Subject<ModalAction>).next(action);
      if (action.type === 'close' || action.type === 'button') {
        this.store.removeModal(id);
        entry.actionSubject.complete();
      }
    }
  }

  /** Get the top (visible) modal */
  get topModal(): ModalEntry | undefined {
    return this.store.modals()[0];
  }
}
