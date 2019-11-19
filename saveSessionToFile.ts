import { ISession } from "../api.js";
import { saveToJson } from "./saveToFile.js";

export const saveSessionToFile = (session: ISession, basename: string) =>
  saveToJson(`${basename}.bronze`, session);
