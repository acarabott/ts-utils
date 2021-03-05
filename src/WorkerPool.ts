export class WorkerPool {
    protected workerPool: Map<Worker, boolean>;
    protected workerQueue: Array<(worker: Worker) => void>;

    constructor(workerFactory: () => Worker, maxWorkers: number) {
        this.workerPool = new Map<Worker, boolean>();
        this.workerQueue = [];

        for (let i = 0; i < maxWorkers; ++i) {
            const worker = workerFactory();
            this.workerPool.set(worker, true);
        }
    }

    public getWorker(): Promise<Worker> {
        return new Promise((success) => {
            const availableWorker = this.getAvailableWorker();

            if (availableWorker !== undefined) {
                this.claimWorker(availableWorker);
                success(availableWorker);
            } else {
                this.queueWorkerRequest((worker: Worker) => {
                    this.claimWorker(worker);
                    success(worker);
                });
            }
        });
    }

    public freeWorker(worker: Worker) {
        this.workerPool.set(worker, true);

        const queuedFunction = this.workerQueue.shift();
        if (queuedFunction !== undefined) {
            queuedFunction(worker);
        }
    }

    protected getAvailableWorker() {
        const pair = Array.from(this.workerPool.entries()).find(([, available]) => available);
        return pair === undefined ? undefined : pair[0];
    }

    protected queueWorkerRequest(onAvailable: (worker: Worker) => void) {
        this.workerQueue.push(onAvailable);
    }

    protected claimWorker(worker: Worker) {
        this.workerPool.set(worker, false);
    }
}
