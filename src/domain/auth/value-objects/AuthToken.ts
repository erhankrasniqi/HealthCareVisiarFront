import { ValueObject } from "../../shared/ValueObject";

export class AuthToken extends ValueObject<string> {
  private constructor(token: string) {
    super(token);
  }

  static create(token: string): AuthToken {
    return new AuthToken(token);
  }

  get value(): string {
    return this._value;
  }

  isExpired(): boolean {
    try {
      const payload = JSON.parse(atob(this._value.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
