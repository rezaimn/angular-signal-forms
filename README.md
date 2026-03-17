# Angular 21 Modal System

Type-safe modal system with priority queue, NgRx signals store, and action subscriptions.

## Features

- **Priority queue** – Modals sorted by priority (higher = shown first)
- **NgRx Signal Store** – Modal queue managed via `@ngrx/signals`
- **Full type safety** – `TData` flows to the component, `TAction` flows back to your subscription
- **Action subscriptions** – Subscribe to close/button clicks from where you open the modal
- **Content projection** – Use `ModalBaseComponent` with `ng-content` to include child components

## Usage

```ts
// Open a modal and subscribe to actions
const ref = modalService.open<ConfirmDialogData, ConfirmDialogAction>({
  component: ConfirmDialogComponent,
  data: { title: 'Confirm', message: 'Are you sure?' },
  priority: 5, // optional, default 0
});

ref.actions$.subscribe((action) => {
  if (action.type === 'button' && action.buttonId === 'confirm') {
    // User confirmed
  }
});
```

## Modal components

Implement `modalData`, `modalActions`, and optionally `modalContent` inputs. Use `ModalBaseComponent` for content projection:

```ts
@Component({...})
export class MyModalComponent {
  readonly modalData = input<MyData>();
  readonly modalActions = input<(action: MyAction) => void>();
  readonly modalContent = input<ModalContentSlots>();

  onConfirm() {
    this.modalActions()?.({ type: 'button', buttonId: 'confirm' });
  }
}
```

## Structure

- `src/app/modal/` – Core modal system (types, store, service, container, base)
- `src/app/demo/` – Example modals (ConfirmDialog, DeleteConfirmDialog with UserAvatar child)
