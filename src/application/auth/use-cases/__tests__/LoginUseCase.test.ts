import { LoginUseCase } from "../LoginUseCase";
import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { ILogger } from "@domain/shared/ILogger";
import { User } from "@domain/auth/User";
import { Email } from "@domain/auth/value-objects/Email";
import { AuthToken } from "@domain/auth/value-objects/AuthToken";
import { success, failure } from "@domain/shared/Result";
import { InvalidCredentialsError } from "@domain/shared/errors";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    loginUseCase = new LoginUseCase(mockAuthRepository, mockLogger);
  });

  it("should successfully login with valid credentials", async () => {
    const emailResult = Email.create("test@example.com");
    if (!emailResult.isSuccess) throw new Error("Email creation failed");

    const mockUser = User.create({
      id: "123",
      email: emailResult.value,
      name: "Test User",
      createdAt: new Date(),
    });
    const mockToken = AuthToken.create("mock-token");

    mockAuthRepository.login.mockResolvedValue(success({ user: mockUser, token: mockToken }));

    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.user.email).toBe("test@example.com");
      expect(result.value.token).toBe("mock-token");
    }
    expect(mockLogger.info).toHaveBeenCalledWith("Login attempt", {
      email: "test@example.com",
    });
  });

  it("should fail with invalid email format", async () => {
    const result = await loginUseCase.execute({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toContain("Validation");
    }
  });

  it("should fail with invalid credentials", async () => {
    mockAuthRepository.login.mockResolvedValue(failure(new InvalidCredentialsError()));

    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toBe("Invalid email or password");
    }
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("should validate password minimum length", async () => {
    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "123",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toContain("Validation");
    }
  });
});
