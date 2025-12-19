import { RegisterUseCase } from "../RegisterUseCase";
import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { ILogger } from "@domain/shared/ILogger";
import { User } from "@domain/auth/User";
import { Email } from "@domain/auth/value-objects/Email";
import { success, failure } from "@domain/shared/Result";
import { AuthenticationError } from "@domain/shared/errors";

describe("RegisterUseCase", () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockAuthRepository, mockLogger);
  });

  it("should successfully register with valid data", async () => {
    const emailResult = Email.create("test@example.com");
    if (!emailResult.isSuccess) throw new Error("Test setup failed");
    
    const mockUser = User.create({
      id: "123",
      email: emailResult.value,
      name: "John Doe",
      createdAt: new Date(),
    });

    mockAuthRepository.register.mockResolvedValue(success(mockUser));

    const result = await registerUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      password: "password123",
      phoneNumber: "+1234567890",
      dateOfBirth: "2000-01-01",
      address: "123 Main St",
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.email).toBe("test@example.com");
      expect(result.value.name).toBe("John Doe");
    }
    expect(mockLogger.info).toHaveBeenCalledWith("Registration attempt", {
      email: "test@example.com",
    });
  });

  it("should fail with invalid email format", async () => {
    const result = await registerUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "invalid-email",
      password: "password123",
      phoneNumber: "+1234567890",
      dateOfBirth: "2000-01-01",
      address: "123 Main St",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toContain("Validation");
    }
  });

  it("should fail when repository returns error", async () => {
    mockAuthRepository.register.mockResolvedValue(
      failure(new AuthenticationError("Email already exists"))
    );

    const result = await registerUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      password: "password123",
      phoneNumber: "+1234567890",
      dateOfBirth: "2000-01-01",
      address: "123 Main St",
    });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toBe("Email already exists");
    }
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("should validate required fields", async () => {
    const result = await registerUseCase.execute({
      firstName: "J",
      lastName: "D",
      email: "test@example.com",
      password: "123",
      phoneNumber: "123",
      dateOfBirth: "2000-01-01",
      address: "123",
    });

    expect(result.isFailure).toBe(true);
  });
});
