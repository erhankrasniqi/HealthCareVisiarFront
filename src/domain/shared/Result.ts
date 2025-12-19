// Result type for error handling
export type Result<T, E = never> = Success<T, E> | Failure<E>;

export class Success<T, E = never> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(public readonly value: T) {}

  static of<T, E = never>(value: T): Success<T, E> {
    return new Success<T, E>(value);
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(public readonly error: E) {}

  static of<E>(error: E): Failure<E> {
    return new Failure(error);
  }
}

export const success = <T, E = never>(value: T): Result<T, E> => Success.of<T, E>(value);
export const failure = <E>(error: E): Result<never, E> => Failure.of(error);
