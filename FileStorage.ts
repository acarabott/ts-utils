import { StorageIndexedDB } from "./StorageIndexedDB";

// TODO this should be in a config file somewhere?
export const DB_NAME = "bronze-composer";
export const DB_VERSION = 9;

export interface IFileStorage {
  get(filename: string): Promise<File>;
  getMany(indexName: string, count?: number): Promise<File[]>;
  add(file: File): Promise<void>;
  replace(file: File): Promise<void>;
  removeMany(filenames: string[]): Promise<void>;
  remove(filename: string): Promise<void>;
}

export class FileStorageIndexedDB implements IFileStorage {
  public static get keyPath() {
    return "name";
  }
  public static get fileIndexNames() {
    return ["lastModified", "lastModifiedDate", "size", "type"];
  }

  protected storage: StorageIndexedDB<File>;
  constructor(dbName: string, dbVersion: number, storeName: string) {
    this.storage = new StorageIndexedDB(
      dbName,
      dbVersion,
      storeName,
      FileStorageIndexedDB.keyPath,
      FileStorageIndexedDB.fileIndexNames,
    );
  }

  public get ready() {
    return this.storage.ready;
  }

  public get(filename: string) {
    return this.storage.get(filename);
  }

  public getMany(indexName: string, count?: number) {
    return this.storage.getMany(indexName, count);
  }

  public add(file: File) {
    return this.storage.add(file.name, file);
  }

  public replace(file: File) {
    return this.storage.replace(file.name, file);
  }

  public removeMany(filenames: string[]) {
    return this.storage.removeMany(filenames);
  }

  public remove(filename: string) {
    return this.storage.remove(filename);
  }
}
