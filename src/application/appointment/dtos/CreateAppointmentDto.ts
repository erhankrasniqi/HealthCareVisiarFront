import { z } from "zod";

export const CreateAppointmentDtoSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  reason: z.string().min(1, "Reason is required"),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentDtoSchema>;

export const validateCreateAppointmentDto = (data: unknown): CreateAppointmentDto => {
  return CreateAppointmentDtoSchema.parse(data);
};
