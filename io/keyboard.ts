export class Keyboard {
  private static _stateDown: Record<string, boolean> = {};

  public static init() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      this._stateDown[e.code] = true;
    });
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      this._stateDown[e.code] = false;
    });
  }

  public static isKeyDown(key: string): boolean {
    return this._stateDown[key] == true;
  }

  public static isKeyUp(key: string): boolean {
    return !this._stateDown[key];
  }
}
