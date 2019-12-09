import { Cursor, IAtom } from "@thi.ng/atom";

export const cursorT = <T, P extends keyof T>(atom: IAtom<T>, path: P) =>
  new Cursor<T[P]>(atom, path);
