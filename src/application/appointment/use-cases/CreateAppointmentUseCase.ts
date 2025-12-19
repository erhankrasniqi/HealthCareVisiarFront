import { IAppointmentRepository } from "@domain/appointment/IAppointmentRepository";
import { ILogger } from "@domain/shared/ILogger";
import { Result, success, failure } from "@domain/shared/Result";
import { CreateAppointmentDto, validateCreateAppointmentDto } from "../dtos/CreateAppointmentDto";
import { ValidationError } from "@application/shared/errors";
import { DomainError } from "@domain/shared/errors";
import { AppointmentEntity } from "@domain/appointment/Appointment";
import { z } from "zod";

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateAppointmentDto): Promise<Result<AppointmentEntity, ValidationError | DomainError>> {
    try {
      // Validate input
      const validatedDto = validateCreateAppointmentDto(dto);
      this.logger.info("Create appointment attempt", { doctorId: validatedDto.doctorId });

      // Call repository
      const appointmentResult = await this.appointmentRepository.createAppointment({
        doctorId: validatedDto.doctorId,
        appointmentDate: new Date(validatedDto.appointmentDate),
        startTime: validatedDto.startTime,
        endTime: validatedDto.endTime,
        reason: validatedDto.reason,
      });

      if (appointmentResult.isFailure) {
        this.logger.warn("Appointment creation failed", {
          error: appointmentResult.error.message,
        });
        return failure(appointmentResult.error);
      }

      const appointment = appointmentResult.value;
      this.logger.info("Appointment created successfully", { appointmentId: appointment.id });

      return success(appointment);
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
        
        const firstError = error.issues[0];
        const fieldName = firstError.path.join(".");
        const errorMessage = `${fieldName}: ${firstError.message}`;
        
        return failure(new ValidationError(errorMessage, fields));
      }

      this.logger.error("Unexpected error during appointment creation", error as Error);
      return failure(new ValidationError("An unexpected error occurred"));
    }
  }
}
