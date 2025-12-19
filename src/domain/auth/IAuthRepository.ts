import { User } from "./User";
import { Email } from "./value-objects/Email";
import { AuthToken } from "./value-objects/AuthToken";
import { Result } from "../shared/Result";
import { DomainError } from "../shared/errors";

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: Email;
  password: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: string;
}

export interface IAuthRepository {
  login(
    email: Email,
    password: string
  ): Promise<Result<{ user: User; token: AuthToken }, DomainError>>;
  register(data: RegisterUserData): Promise<Result<User, DomainError>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<Result<User, DomainError>>;
}
