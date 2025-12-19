export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email format: ${email}`, "INVALID_EMAIL");
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS");
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string) {
    super(message, "AUTHENTICATION_ERROR");
  }
}
