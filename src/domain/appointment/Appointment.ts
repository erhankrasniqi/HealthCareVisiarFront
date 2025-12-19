export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  status?: string;
  createdAt: Date;
}

export class AppointmentEntity {
  private constructor(
    public readonly id: string,
    public readonly doctorId: string,
    public readonly patientId: string,
    public readonly appointmentDate: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly reason: string,
    public readonly status: string,
    public readonly createdAt: Date
  ) {}

  static create(data: {
    id: string;
    doctorId: string;
    patientId: string;
    appointmentDate: Date;
    startTime: string;
    endTime: string;
    reason: string;
    status?: string;
    createdAt: Date;
  }): AppointmentEntity {
    return new AppointmentEntity(
      data.id,
      data.doctorId,
      data.patientId,
      data.appointmentDate,
      data.startTime,
      data.endTime,
      data.reason,
      data.status || "pending",
      data.createdAt
    );
  }
}
