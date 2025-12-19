import { IAppointmentRepository, CreateAppointmentData } from "@domain/appointment/IAppointmentRepository";
import { AppointmentEntity } from "@domain/appointment/Appointment";
import { Result, success, failure } from "@domain/shared/Result";
import { DomainError, AuthenticationError } from "@domain/shared/errors";
import { IHttpClient } from "@domain/shared/IHttpClient";
import { ApiError } from "../http/HttpClientFetch";

interface AppointmentResponse {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status?: string;
  createdAt: string;
}

export class AppointmentApiRepository implements IAppointmentRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async createAppointment(data: CreateAppointmentData): Promise<Result<AppointmentEntity, DomainError>> {
    try {
      const response = await this.httpClient.post<AppointmentResponse>("/api/appointments", {
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate.toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason,
      });

      const appointment = AppointmentEntity.create({
        id: response.id,
        doctorId: response.doctorId,
        patientId: response.patientId,
        appointmentDate: new Date(response.appointmentDate),
        startTime: response.startTime,
        endTime: response.endTime,
        reason: response.reason,
        status: response.status,
        createdAt: new Date(response.createdAt),
      });

      return success(appointment);
    } catch (error) {
      if (error instanceof ApiError) {
        return failure(new AuthenticationError(error.message));
      }
      return failure(new AuthenticationError("Failed to create appointment"));
    }
  }
}
