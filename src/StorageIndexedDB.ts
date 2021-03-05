export interface IIndexedDBOpenResponse {
    db: IDBDatabase;
    dbRequest: IDBOpenDBRequest;
}

export interface IStorageAddRejectionResult {
    readonly exists: boolean;
    readonly msg: string;
}

type OpenResponseSuccess = (response: IIndexedDBOpenResponse) => void;

export class StorageIndexedDB<T> {
    public readonly dbName: string;
    public readonly dbVersion: number;
    public readonly storeName: string;
    public readonly keyPath: string;
    public readonly ready: Promise<IIndexedDBOpenResponse>;

    constructor(dbName: string, dbVersion: number, storeName: string, keyPath: string, otherIndexNames: string[] = []) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.storeName = storeName;
        this.keyPath = keyPath;

        this.ready = new Promise<IIndexedDBOpenResponse>((success: OpenResponseSuccess, reject) => {
            const dbRequest = indexedDB.open(dbName, dbVersion);

            dbRequest.onsuccess = () => {
                const db: IDBDatabase = dbRequest.result;
                db.onversionchange = () => db.close();
                success({ db, dbRequest });
            };

            dbRequest.onupgradeneeded = () => {
                const db: IDBDatabase = dbRequest.result;

                try {
                    const objectStore = db.objectStoreNames.contains(storeName)
                        ? db.transaction([storeName]).objectStore(storeName)
                        : db.createObjectStore(storeName, { keyPath });

                    if (!objectStore.indexNames.contains(keyPath)) {
                        objectStore.createIndex(keyPath, keyPath, { unique: true });
                    }

                    const newIndexNames = otherIndexNames.filter((name) => !objectStore.indexNames.contains(name));

                    for (const index of newIndexNames) {
                        objectStore.createIndex(index, index, { unique: false });
                    }

                    objectStore.transaction.oncomplete = () =>
                        success({
                            db: dbRequest.result,
                            dbRequest,
                        });

                    objectStore.transaction.onerror = (event) =>
                        reject({
                            msg: "creating store failed",
                            event,
                        });
                } catch (error) {
                    reject({ msg: `Ensuring store ${storeName} failed`, error });
                    alert(`The storage database needs to be upgraded.The page will now refresh!`);

                    if (document.location !== null) {
                        document.location.reload();
                    }
                }
            };

            dbRequest.onerror = (event) => {
                const msg = dbRequest.error === null ? "IndexedDB dbRequest error" : dbRequest.error.message;
                reject({ msg, event });
            };
            dbRequest.onblocked = (event) => reject({ msg: "Please close other tabs", event });
        });
    }

    public get(key: string) {
        return new Promise<T>((success, reject) => {
            this.ready.then((response) => {
                try {
                    const transaction = response.db.transaction(this.storeName);
                    transaction.onerror = (event) =>
                        reject({
                            msg: `Getting ${key} from store ${this.storeName} failed`,
                            event,
                        });

                    const objectStore = transaction.objectStore(this.storeName);
                    const getRequest = objectStore.get(key);
                    getRequest.onsuccess = () => success(getRequest.result);
                    getRequest.onerror = (event) =>
                        reject({
                            msg: `Getting ${key} from store ${this.storeName} failed`,
                            event,
                        });
                } catch (error) {
                    reject({
                        msg: `Getting ${key} from store ${this.storeName} failed`,
                        error,
                    });
                }
            });
        });
    }

    public getMany(indexName: string = this.keyPath, count?: number) {
        return new Promise<T[]>((success, reject) => {
            this.ready.then((response) => {
                const results: T[] = [];

                try {
                    const transaction = response.db.transaction(this.storeName);
                    transaction.oncomplete = () => success(results);
                    transaction.onerror = (event) =>
                        reject({
                            msg: `Getting store ${this.storeName} failed`,
                            event,
                        });

                    const objectStore = transaction.objectStore(this.storeName);
                    const index = objectStore.index(indexName);

                    const allRequest = index.getAll(count);
                    allRequest.onerror = () => reject({ msg: "requesting items failed", event });
                } catch (error) {
                    reject({
                        msg: `Getting many from store ${this.storeName} with index ${indexName} failed`,
                        error,
                    });
                }
            });
        });
    }

    public add(key: string, value: T) {
        return new Promise<void>(async (success, reject) => {
            const existingValue = await this.get(key);
            const exists = existingValue !== undefined;
            if (exists) {
                reject({ exists, msg: "File already exists" });
            }

            return this.ready.then((response) => {
                try {
                    const transaction = response.db.transaction([this.storeName], "readwrite");
                    transaction.oncomplete = () => success();
                    transaction.onerror = (event) =>
                        reject({
                            exists,
                            msg: `adding ${key} failed`,
                            event,
                        } as IStorageAddRejectionResult);

                    const objectStore = transaction.objectStore(this.storeName);

                    const addRequest = objectStore.add(value);

                    addRequest.onerror = (event) =>
                        reject({
                            exists,
                            msg: addRequest.error === null ? "Add request failed" : addRequest.error.message,
                            event,
                        } as IStorageAddRejectionResult);
                } catch (error) {
                    reject({
                        exists,
                        msg: `adding ${key} failed`,
                        error,
                    } as IStorageAddRejectionResult);
                }
            });
        });
    }

    public replace(key: string, value: T) {
        return new Promise<void>(async (success, reject) => {
            return this.ready.then((response) => {
                try {
                    const transaction = response.db.transaction([this.storeName], "readwrite");
                    transaction.oncomplete = () => success();
                    transaction.onerror = (event) => reject({ msg: `replacing ${key} failed`, event });

                    const objectStore = transaction.objectStore(this.storeName);

                    const putRequest = objectStore.put(value);
                    putRequest.onerror = (event) => reject({ msg: `replacing ${key} failed`, event });
                } catch (error) {
                    reject({ msg: `replacing ${key} failed`, error });
                }
            });
        });
    }

    public removeMany(keys: string[]) {
        return new Promise<void>((success, reject) => {
            return this.ready.then(async (response) => {
                try {
                    const transaction = response.db.transaction([this.storeName], "readwrite");
                    transaction.oncomplete = () => success();
                    transaction.onerror = (event) =>
                        reject({
                            msg: `removing ${keys} failed`,
                            event,
                        });

                    const objectStore = transaction.objectStore(this.storeName);

                    Promise.all(
                        keys.map((key) => {
                            return new Promise((_success, allReject) => {
                                const deleteRequest = objectStore.delete(key);
                                deleteRequest.onerror = (event) =>
                                    allReject({
                                        msg: `removing ${key} failed`,
                                        event,
                                    });
                            });
                        }),
                    ).then(
                        () => success,
                        (event) =>
                            reject({
                                msg: `removing ${keys} failed`,
                                event,
                            }),
                    );
                } catch (error) {
                    reject({ msg: `removing ${keys} failed`, error });
                }
            });
        });
    }

    public remove(key: string) {
        return this.removeMany([key]);
    }
}
