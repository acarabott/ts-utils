type CreateFunc<T> = () => T;
type ResetFunc<T> = (obj: T) => void;

export class ObjectPool<T> {
  protected objects: T[];
  protected createFunc: CreateFunc<T>;
  protected resetFunc?: ResetFunc<T>;

  constructor(size: number, createFunc: CreateFunc<T>, resetFunc?: ResetFunc<T>) {
    this.createFunc = createFunc;
    this.resetFunc = resetFunc;
    this.objects = Array.from(Array(size)).map(createFunc);
  }

  public get(): T {
    const obj = this.objects.shift();
    return obj === undefined ? this.createFunc() : obj;
  }

  public release(obj: T) {
    if (this.resetFunc !== undefined) {
      this.resetFunc(obj);
    }

    if (this.objects.indexOf(obj) !== -1) {
      return;
    }
    this.objects.push(obj);
  }
}
