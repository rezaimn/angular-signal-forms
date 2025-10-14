import { Observable } from 'rxjs';
import { concatAll, mergeAll, switchAll } from 'rxjs/operators';

// A flattening operator type that converts a higher-order Observable into a first-order one
export type FlatteningOperator = <T>(source: Observable<Observable<T>>) => Observable<T>;

export const concatOp: FlatteningOperator = <T>(source: Observable<Observable<T>>): Observable<T> => {
  return source.pipe(concatAll());
};

export const mergeOp: FlatteningOperator = <T>(source: Observable<Observable<T>>): Observable<T> => {
  return source.pipe(mergeAll());
};

export const switchOp: FlatteningOperator = <T>(source: Observable<Observable<T>>): Observable<T> => {
  return source.pipe(switchAll());
};
