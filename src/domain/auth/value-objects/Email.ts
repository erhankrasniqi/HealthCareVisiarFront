import { ValueObject } from "../../shared/ValueObject";
import { InvalidEmailError } from "../../shared/errors";
import { Result, success, failure } from "../../shared/Result";

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(email: string) {
    super(email);
  }

  static create(email: string): Result<Email, InvalidEmailError> {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail || !this.EMAIL_REGEX.test(trimmedEmail)) {
      return failure(new InvalidEmailError(email));
    }
    return success(new Email(trimmedEmail.toLowerCase()));
  }

  get value(): string {
    return this._value;
  }
}
