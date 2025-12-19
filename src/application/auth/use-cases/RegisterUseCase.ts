import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { Email } from "@domain/auth/value-objects/Email";
import { ILogger } from "@domain/shared/ILogger";
import { Result, success, failure } from "@domain/shared/Result";
import { RegisterDto, validateRegisterDto } from "../dtos/RegisterDto";
import { UserDto, UserMapper } from "../mappers/UserMapper";
import { ValidationError } from "@application/shared/errors";
import { DomainError } from "@domain/shared/errors";
import { z } from "zod";

export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly logger: ILogger
  ) {}

  async execute(dto: RegisterDto): Promise<Result<UserDto, ValidationError | DomainError>> {
    try {
      // Validate input
      const validatedDto = validateRegisterDto(dto);
      this.logger.info("Registration attempt", { email: validatedDto.email });

      // Create Email value object
      const emailResult = Email.create(validatedDto.email);
      if (emailResult.isFailure) {
        this.logger.warn("Invalid email format", { email: validatedDto.email });
        return failure(new ValidationError("Invalid email format"));
      }

      // Call repository
      const registerResult = await this.authRepository.register({
        firstName: validatedDto.firstName,
        lastName: validatedDto.lastName,
        email: emailResult.value,
        password: validatedDto.password,
        phoneNumber: validatedDto.phoneNumber,
        dateOfBirth: new Date(validatedDto.dateOfBirth),
        address: validatedDto.address,
      });

      if (registerResult.isFailure) {
        this.logger.warn("Registration failed", {
          email: validatedDto.email,
          error: registerResult.error.message,
        });
        return failure(registerResult.error);
      }

      const user = registerResult.value;
      this.logger.info("Registration successful", { userId: user.id });

      return success(UserMapper.toDto(user));
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn("Validation error", { errors: error.issues });
        const fields = error.issues.reduce(
          (acc: Record<string, string[]>, err) => {
            const field = err.path.join(".");
            acc[field] = acc[field] || [];
            acc[field].push(err.message);
            return acc;
          },
          {} as Record<string, string[]>
        );
        
        // Create user-friendly error message
        const firstError = error.issues[0];
        const fieldName = firstError.path.join(".");
        const errorMessage = `${fieldName}: ${firstError.message}`;
        
        return failure(new ValidationError(errorMessage, fields));
      }

      this.logger.error("Unexpected error during registration", error as Error);
      return failure(new ValidationError("An unexpected error occurred during registration"));
    }
  }
}
