import { LoginUseCase } from "@application/auth/use-cases/LoginUseCase";
import { RegisterUseCase } from "@application/auth/use-cases/RegisterUseCase";
import { CreateAppointmentUseCase } from "@application/appointment/use-cases/CreateAppointmentUseCase";
import { AuthApiRepository } from "@infrastructure/repositories/AuthApiRepository";
import { AppointmentApiRepository } from "@infrastructure/repositories/AppointmentApiRepository";
import { HttpClientFetch } from "@infrastructure/http/HttpClientFetch";
import { ConsoleLogger } from "@infrastructure/logging/ConsoleLogger";
import { LocalStorage } from "@infrastructure/storage/LocalStorage";
import { TokenStorage } from "@infrastructure/storage/TokenStorage";
import { env } from "@infrastructure/config/env";

// Container for dependency injection
class Container {
  private static instance: Container;

  // Infrastructure dependencies
  private _logger = new ConsoleLogger();
  private _storage = new LocalStorage();
  private _tokenStorage = new TokenStorage(this._storage);
  // Use same-origin Next.js API routes (e.g. /api/auth/login) so the server can set HttpOnly cookies.
  private _httpClient = new HttpClientFetch("");

  // Repositories
  private _authRepository = new AuthApiRepository(this._httpClient, this._tokenStorage);
  private _appointmentRepository = new AppointmentApiRepository(this._httpClient);

  // Use cases
  private _loginUseCase = new LoginUseCase(this._authRepository, this._logger);
  private _registerUseCase = new RegisterUseCase(this._authRepository, this._logger);
  private _createAppointmentUseCase = new CreateAppointmentUseCase(this._appointmentRepository, this._logger);

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get logger() {
    return this._logger;
  }

  get storage() {
    return this._storage;
  }

  get tokenStorage() {
    return this._tokenStorage;
  }

  get httpClient() {
    return this._httpClient;
  }

  get authRepository() {
    return this._authRepository;
  }

  get loginUseCase() {
    return this._loginUseCase;
  }

  get registerUseCase() {
    return this._registerUseCase;
  }

  get appointmentRepository() {
    return this._appointmentRepository;
  }

  get createAppointmentUseCase() {
    return this._createAppointmentUseCase;
  }
}

export const container = Container.getInstance();
