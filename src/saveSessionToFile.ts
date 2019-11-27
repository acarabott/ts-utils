import { ISession } from "../api";
import { saveToJson } from "./saveToFile";

export const saveSessionToFile = (session: ISession, basename: string) =>
  saveToJson(`${basename}.bronze`, session);
