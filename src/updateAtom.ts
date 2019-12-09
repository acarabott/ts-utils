import { Atom } from "@thi.ng/atom";

export const updateAtom = <T>(atom: Atom<T>, update: Partial<T>) =>
  atom.reset({ ...atom.value, ...update });

export const updateAtomFactory = <T>(atom: Atom<T>) => (update: Partial<T>) =>
  updateAtom(atom, update);

export const swapAtom = <T, P extends keyof T, V = T[P]>(
  atom: Atom<T>,
  path: P,
  swapFn: (value: V) => V,
) => atom.swapIn<V>(path, swapFn);

export const resetAtom = <T, P extends keyof T, V = T[P]>(atom: Atom<T>, path: P, value: V) =>
  atom.resetIn<V>(path, value);

export const addView = <A, P extends keyof A, V>(
  atom: Atom<A>,
  path: P,
  tx: (x: A[P]) => V,
  lazy?: boolean | undefined,
) => atom.addView<V>(path, tx, lazy);
