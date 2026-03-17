import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { ModalEntry, ModalId } from './modal.types';

export interface ModalQueueState {
  /** Queue of modals sorted by priority (highest first) */
  modals: ModalEntry[];
}

const initialState: ModalQueueState = {
  modals: [],
};

export const ModalQueueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addModal(entry: ModalEntry) {
      const modals = [...store.modals(), entry].sort((a, b) => b.priority - a.priority);
      patchState(store, { modals });
    },
    removeModal(id: ModalId) {
      const modals = store.modals().filter((m) => m.id !== id);
      patchState(store, { modals });
    },
    clearAll() {
      patchState(store, { modals: [] });
    },
  }))
);
