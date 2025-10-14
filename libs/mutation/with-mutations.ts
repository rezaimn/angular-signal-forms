// Decoupled withMutations helper. The types here are independent of any specific transport like HTTP.
// You can use this inside an NgRx Signal Store or any other store-like construct.

import type { Mutation } from './mutation';

// Public surface: a callable mutation that accepts (input, ctx?)
export type CallableMutation<Input, Ctx = unknown> = (input: Input, ctx?: Ctx) => void;

// A small adapter to expose a plain callable from a Mutation instance
export function asCallable<Input, Output, Ctx>(m: Mutation<Input, Output, Ctx>): CallableMutation<Input, Ctx> {
  return (input: Input, ctx?: Ctx) => m.trigger(input, ctx);
}

// A generic withMutations factory: given a store, return a record of callable mutations.
// This remains fully transport-agnostic; individual mutations can be created with httpMutation, rxMutation, etc.
export function withMutations<Store, Mutations extends Record<string, CallableMutation<any, any>>>(
  factory: (store: Store) => Mutations,
) {
  return (store: Store): Mutations => factory(store);
}
