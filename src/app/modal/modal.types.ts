import type { TemplateRef, Type } from '@angular/core';
import type { Subject } from 'rxjs';

/** Unique modal identifier */
export type ModalId = string;

/** Base action emitted when modal is closed or a button is clicked */
export type ModalActionBase =
  | { type: 'close'; source: 'backdrop' | 'escape' | 'button' }
  | { type: 'button'; buttonId: string; payload?: unknown };

/** Generic modal action - extend this for your modal's specific actions */
export type ModalAction<TAction extends ModalActionBase = ModalActionBase> = TAction;

/** Content slots for projecting child components into the modal */
export interface ModalContentSlots {
  header?: TemplateRef<unknown>;
  body?: TemplateRef<unknown>;
  footer?: TemplateRef<unknown>;
}

/** Configuration for opening a modal - fully type-safe */
export interface ModalConfig<TData = unknown, TAction extends ModalActionBase = ModalActionBase> {
  /** Component type to render inside the modal */
  component: Type<unknown>;
  /** Type-safe data passed to the modal component */
  data: TData;
  /** Priority (higher = shown first). Default: 0 */
  priority?: number;
  /** Optional content to project into the modal's slots */
  content?: ModalContentSlots;
  /** Close on backdrop click. Default: true */
  closeOnBackdrop?: boolean;
  /** Close on escape. Default: true */
  closeOnEscape?: boolean;
}

/** Interface that modal components receive via inputs for type safety */
export interface ModalComponentInputs<TData = unknown, TAction extends ModalActionBase = ModalActionBase> {
  modalData?: TData;
  modalActions?: (action: TAction) => void;
  /** Optional projected content - use in template with ngTemplateOutlet */
  modalContent?: ModalContentSlots;
}

/** Internal modal entry in the queue */
export interface ModalEntry<TData = unknown, TAction extends ModalActionBase = ModalActionBase> {
  id: ModalId;
  priority: number;
  config: ModalConfig<TData, TAction>;
  /** Resolve/reject for the caller's subscription */
  actionSubject: Subject<ModalAction<TAction>>;
}
