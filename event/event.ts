export class EventEmitter {
  private _list: Record<string, ((...data: any[]) => void)[]> = {};

  constructor() {}

  public on(name: string, fn: (...data: any[]) => void) {
    if (!this._list[name]) this._list[name] = [];
    this._list[name].push(fn);
  }

  public clear() {
    this._list = {};
  }

  public emit(name: string, ...data: any[]) {
    if (!this._list[name]) return;
    this._list[name].forEach((x) => {
      x(...data);
    });
  }
}
