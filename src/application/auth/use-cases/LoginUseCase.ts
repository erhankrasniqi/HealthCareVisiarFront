import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { Email } from "@domain/auth/value-objects/Email";
import { ILogger } from "@domain/shared/ILogger";
import { Result, success, failure } from "@domain/shared/Result";
import { LoginDto, validateLoginDto } from "../dtos/LoginDto";
import { UserDto, UserMapper } from "../mappers/UserMapper";
import { ValidationError, UnauthorizedError } from "@application/shared/errors";
import { DomainError, InvalidCredentialsError } from "@domain/shared/errors";
import { z } from "zod";

export interface LoginResult {
  user: UserDto;
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly logger: ILogger
  ) {}

  async execute(dto: LoginDto): Promise<Result<LoginResult, ValidationError | UnauthorizedError>> {
    try {
      // Validate input
      const validatedDto = validateLoginDto(dto);
      this.logger.info("Login attempt", { email: validatedDto.email });

      // Create Email value object
      const emailResult = Email.create(validatedDto.email);
      if (emailResult.isFailure) {
        this.logger.warn("Invalid email format", { email: validatedDto.email });
        return failure(new ValidationError("Invalid email format"));
      }

      // Call repository
      const authResult = await this.authRepository.login(emailResult.value, validatedDto.password);

      if (authResult.isFailure) {
        const error = authResult.error;
        this.logger.warn("Login failed", { email: validatedDto.email, error: error.message });

        if (error instanceof InvalidCredentialsError) {
          return failure(new UnauthorizedError("Invalid email or password"));
        }

        return failure(new UnauthorizedError(error.message));
      }

      const { user, token } = authResult.value;
      this.logger.info("Login successful", { userId: user.id });

      return success({
        user: UserMapper.toDto(user),
        token: token.value,
      });
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
        return failure(new ValidationError("Validation failed", fields));
      }

      this.logger.error("Unexpected error during login", error as Error);
      return failure(new UnauthorizedError("An unexpected error occurred"));
    }
  }
}
