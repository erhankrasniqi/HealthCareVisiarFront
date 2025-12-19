import { Result } from "@domain/shared/Result";
import { DomainError } from "@domain/shared/errors";
import { AppointmentEntity } from "./Appointment";

export interface CreateAppointmentData {
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface IAppointmentRepository {
  createAppointment(data: CreateAppointmentData): Promise<Result<AppointmentEntity, DomainError>>;
}
