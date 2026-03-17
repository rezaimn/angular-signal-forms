import { inject, InjectionToken } from '@angular/core';
import type { ModalAction, ModalId } from './modal.types';

export const MODAL_CONTEXT = new InjectionToken<ModalContext>('ModalContext');

export interface ModalContext {
  readonly id: ModalId;
  emit(action: ModalAction): void;
  close(source: 'backdrop' | 'escape' | 'button'): void;
}

export function injectModalContext(): ModalContext {
  return inject(MODAL_CONTEXT);
}
