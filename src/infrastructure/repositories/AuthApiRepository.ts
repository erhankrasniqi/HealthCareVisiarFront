import { IAuthRepository, RegisterUserData } from "@domain/auth/IAuthRepository";
import { User } from "@domain/auth/User";
import { Email } from "@domain/auth/value-objects/Email";
import { AuthToken } from "@domain/auth/value-objects/AuthToken";
import { Result, success, failure } from "@domain/shared/Result";
import { InvalidCredentialsError, AuthenticationError, DomainError } from "@domain/shared/errors";
import { IHttpClient } from "@domain/shared/IHttpClient";
import { ApiError } from "../http/HttpClientFetch";
import { TokenStorage } from "../storage/TokenStorage";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
}

export class AuthApiRepository implements IAuthRepository {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly tokenStorage: TokenStorage
  ) {}

  async login(
    email: Email,
    password: string
  ): Promise<Result<{ user: User; token: AuthToken }, DomainError>> {
    try {
      const response = await this.httpClient.post<LoginResponse>("/api/auth/login", {
        email: email.value,
        password,
      });

      // Save token
      await this.tokenStorage.saveToken(response.token);
      await this.tokenStorage.saveUser(response.user);

      // Create domain entities
      const userEmail = Email.create(response.user.email);
      if (userEmail.isFailure) {
        return failure(userEmail.error);
      }

      const user = User.create({
        id: response.user.id,
        email: userEmail.value,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt),
      });

      const token = AuthToken.create(response.token);

      return success({ user, token });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 401 || error.statusCode === 403) {
          return failure(new InvalidCredentialsError());
        }
        return failure(new AuthenticationError(error.message));
      }
      return failure(new AuthenticationError("An unexpected error occurred"));
    }
  }

  async register(data: RegisterUserData): Promise<Result<User, DomainError>> {
    try {
      const response = await this.httpClient.post<RegisterResponse>("/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.value,
        password: data.password,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth.toISOString(),
        address: data.address,
      });

      // Create domain entity
      const email = Email.create(response.email);
      if (email.isFailure) {
        return failure(email.error);
      }

      const user = User.create({
        id: response.id,
        email: email.value,
        name: `${response.firstName} ${response.lastName}`,
        createdAt: new Date(response.createdAt),
      });

      return success(user);
    } catch (error) {
      if (error instanceof ApiError) {
        return failure(new AuthenticationError(error.message));
      }
      return failure(new AuthenticationError("Registration failed"));
    }
  }

  async logout(): Promise<void> {
    await this.tokenStorage.clear();
  }

  async getCurrentUser(): Promise<Result<User, DomainError>> {
    try {
      const token = await this.tokenStorage.getToken();
      if (!token) {
        return failure(new AuthenticationError("No token found"));
      }

      const response = await this.httpClient.get<LoginResponse["user"]>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      const email = Email.create(response.email);
      if (email.isFailure) {
        return failure(email.error);
      }

      const user = User.create({
        id: response.id,
        email: email.value,
        name: response.name,
        createdAt: new Date(response.createdAt),
      });

      return success(user);
    } catch (error) {
      if (error instanceof ApiError) {
        return failure(new AuthenticationError(error.message));
      }
      return failure(new AuthenticationError("An unexpected error occurred"));
    }
  }
}
