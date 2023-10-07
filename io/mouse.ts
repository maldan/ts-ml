export class Mouse {
  private static _stateDown: Record<string, boolean> = {};

  public static init() {
    document.addEventListener('mousedown', (e: MouseEvent) => {
      this._stateDown[e.button] = true;
    });
    document.addEventListener('mouseup', (e: MouseEvent) => {
      this._stateDown[e.button] = false;
    });
  }

  public static isKeyDown(key: 'left' | 'right' | 'middle'): boolean {
    return this._stateDown[key] == true;
  }

  public static isKeyUp(key: 'left' | 'right' | 'middle'): boolean {
    return !this._stateDown[key];
  }
}
