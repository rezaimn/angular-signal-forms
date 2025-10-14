// Example usage showing ctx only at withMutations layer.
// The HTTP helper knows nothing about ctx, and the core mutation defines the types.

import { httpMutation, withMutations, asCallable, concatOp } from '../libs/mutation';

// Domain types
interface Cat { id: string; name: string; age: number }
interface CatDto { id: string; name: string; age: number }
type CreateCatDto = Pick<Cat, 'name' | 'age'>;
type CatCtx = 'page';

// A simplistic router stand-in
const router = {
  navigate: (url: string) => void 0,
  navigation: { cats: { root: () => '/cats' } },
};

// Store-like shape
interface CatsStoreLike {
  setEntity: (cat: CatDto) => void;
  router: typeof router;
}

function createCatsMutations(store: CatsStoreLike) {
  // Transport-specific mutation: knows nothing about ctx
  const createCatHttp = httpMutation<CreateCatDto, CatDto, unknown>({
    request: (cat) => ({
      url: 'https://demo.angulararchitects.io/api/flight',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cat,
    }),
    operator: concatOp,
    onSuccess: (cat) => store.setEntity(cat),
    onError: (err) => console.error(err),
  });

  // Expose a decoupled API where ctx is only present here
  const newCreate = (input: CreateCatDto, ctx?: CatCtx) => {
    // we can branch on ctx entirely locally
    createCatHttp.output$.subscribe((cat) => {
      if (ctx === 'page') {
        store.router.navigate(store.router.navigation.cats.root());
      }
    });
    createCatHttp.trigger(input);
  };

  return { newCreate };
}

export const withCatsMutations = withMutations(createCatsMutations);
